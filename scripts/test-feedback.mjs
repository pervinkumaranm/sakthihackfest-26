/**
 * Automated Test Suite for Sakthi HackFest'26 Participant Feedback
 * Tests client/server validation, payload normalization, security restrictions,
 * and end-to-end API submission workflow.
 */

import { validateFeedbackPayload, ALLOWED_OPTIONS } from '../api/feedback.ts';
import handler from '../api/feedback.ts';
import crypto from 'crypto';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  }
}

const VALID_SAMPLE_PAYLOAD = {
  participantName: 'S. Jeevanandham (ஜீவா)',
  teamName: 'CyberNova 26',
  q1_registration_experience: 'Excellent',
  q2_registration_issues: 'No issues faced, everything was clear and seamless.',
  q3_problem_statement_clarity: 'Very clear',
  q4_scenarios_usefulness: 'Extremely useful',
  q5_hints_helpfulness: 'Very helpful',
  q6_constraints_timing_clarity: 'Yes, both timing and clarity were good',
  q7_adaptability_fairness: 'Very fairly',
  q8_first_evaluation_fairness: 'Very fair',
  q9_final_evaluation_fairness: 'Very fair',
  q10_judges_technical_knowledge: 'Excellent',
  q11_judges_fair_opportunity: 'Yes, completely',
  q12_evaluation_criteria_consistency: 'Strongly agree',
  q13_portal_experience: 'Excellent',
  q14_portal_issues: 'No issues encountered during the entire duration.',
  q15_organizer_communication: 'Excellent',
  q16_food_and_refreshments: 'Excellent',
  q17_venue_and_facilities: 'Excellent',
  q18_overall_feedback: 'The real-world problem statements and mentors were outstanding! Keep this format for next year.',
};

async function runTests() {
  console.log('\n--- 1. Testing Participant Name & Team Name Validation ---');
  
  // Empty name
  let res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, participantName: '' });
  assert(!res.valid && res.errors.participantName, 'Rejects empty participant name');

  // Whitespace only name
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, participantName: '    ' });
  assert(!res.valid && res.errors.participantName, 'Rejects whitespace-only participant name');

  // Unicode name & initials
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, participantName: '  ரா. ஜீவா (Jeeva M.)  ' });
  assert(res.valid && res.sanitized?.participant_name === 'ரா. ஜீவா (Jeeva M.)', 'Accepts Unicode Tamil name with initials and trims whitespace');

  // Empty team name
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, teamName: '' });
  assert(!res.valid && res.errors.teamName, 'Rejects empty team name');

  // Whitespace only team name
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, teamName: '   ' });
  assert(!res.valid && res.errors.teamName, 'Rejects whitespace-only team name');

  console.log('\n--- 2. Testing All 18 Feedback Questions & Length Limits ---');

  // Missing Q1
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q1_registration_experience: '' });
  assert(!res.valid && res.errors.q1_registration_experience, 'Rejects missing Q1');

  // Invalid Q1 option
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q1_registration_experience: 'Superb' });
  assert(!res.valid && res.errors.q1_registration_experience, 'Rejects invalid option for Q1');

  // Q2 min length < 2
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q2_registration_issues: 'x' });
  assert(!res.valid && res.errors.q2_registration_issues, 'Rejects Q2 length < 2 characters');

  // Q2 max length > 100
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q2_registration_issues: 'a'.repeat(101) });
  assert(!res.valid && res.errors.q2_registration_issues, 'Rejects Q2 length > 100 characters');

  // Q6 invalid option
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q6_constraints_timing_clarity: 'Timing was ok' });
  assert(!res.valid && res.errors.q6_constraints_timing_clarity, 'Rejects invalid option for Q6');

  // Q9 exact option with dash
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q9_final_evaluation_fairness: 'Not applicable \u2014 our team did not reach the final' });
  assert(res.valid && res.sanitized?.q9_final_evaluation_fairness.includes('our team did not reach the final'), 'Accepts exact Q9 non-finalist option');

  // Q14 min & max length
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q14_portal_issues: '  ' });
  assert(!res.valid && res.errors.q14_portal_issues, 'Rejects whitespace-only Q14');

  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q14_portal_issues: 'a'.repeat(101) });
  assert(!res.valid && res.errors.q14_portal_issues, 'Rejects Q14 > 100 characters');

  // Q18 min & max length
  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q18_overall_feedback: '1' });
  assert(!res.valid && res.errors.q18_overall_feedback, 'Rejects Q18 < 2 characters');

  res = validateFeedbackPayload({ ...VALID_SAMPLE_PAYLOAD, q18_overall_feedback: 'a'.repeat(501) });
  assert(!res.valid && res.errors.q18_overall_feedback, 'Rejects Q18 > 500 characters');

  console.log('\n--- 3. Testing API Handler Security and Authorization ---');

  // Mock response helper
  const createMockRes = () => {
    let statusCode = 200;
    let responseData = null;
    return {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
      getData: () => ({ statusCode, responseData }),
    };
  };

  // Public GET should be blocked (401 Unauthorized)
  const getReq = { method: 'GET', headers: {} };
  const getRes = createMockRes();
  await handler(getReq, getRes);
  const getResult = getRes.getData();
  assert(getResult.statusCode === 401 && !getResult.responseData.success, 'Public GET request is denied with 401 Unauthorized');

  // Admin GET with valid token should succeed
  const secret = 'sakthi-hackfest-2026-secure-jwt-secret-key-9921';
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + 60000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const adminToken = `${payload}.${sig}`;

  const adminGetReq = { method: 'GET', headers: { authorization: `Bearer ${adminToken}` } };
  const adminGetRes = createMockRes();
  await handler(adminGetReq, adminGetRes);
  const adminGetResult = adminGetRes.getData();
  assert(adminGetResult.statusCode === 200 || adminGetResult.statusCode === 503, 'Admin GET authorized correctly');

  console.log('\n--- 4. Testing End-to-End Submission & Cleanup ---');

  // Submit a uniquely tagged test record
  const testParticipantName = `__TEST_PARTICIPANT_${Date.now()}__`;
  const testTeamName = `__TEST_TEAM_${Date.now()}__`;
  const testPayload = {
    ...VALID_SAMPLE_PAYLOAD,
    participantName: testParticipantName,
    teamName: testTeamName,
  };

  const postReq = { method: 'POST', headers: {}, body: testPayload };
  const postRes = createMockRes();
  await handler(postReq, postRes);
  const postResult = postRes.getData();

  assert(postResult.statusCode === 200 && postResult.responseData.success, 'Submission succeeds and confirms response');
  const createdId = postResult.responseData.id;
  assert(Boolean(createdId), `Record ID generated: ${createdId}`);

  // Test Cleanup: Delete the exact test record using its unique ID
  const deleteReq = {
    method: 'POST',
    headers: { authorization: `Bearer ${adminToken}` },
    body: { action: 'DELETE_TEST_FEEDBACK', id: createdId },
  };
  const deleteRes = createMockRes();
  await handler(deleteReq, deleteRes);
  const deleteResult = deleteRes.getData();
  assert(deleteResult.statusCode === 200 && deleteResult.responseData.success, `Safely deleted test record ${createdId}`);

  // Clean up any local dev fallback file if created during test
  try {
    const fs = await import('fs');
    const localFallback = '.feedback_submissions.local.json';
    if (fs.existsSync(localFallback)) {
      fs.unlinkSync(localFallback);
    }
  } catch {}

  console.log(`\n==================================================`);
  console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests}`);
  console.log(`==================================================\n`);
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
