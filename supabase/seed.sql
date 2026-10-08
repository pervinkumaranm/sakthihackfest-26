-- ============================================================================
-- SAKTHI HACKFEST 2K26 — Supabase Seed Migration Data
-- Generated from hackfest26.xlsx
-- ============================================================================

-- 1. App Settings
INSERT INTO public.app_settings (key, value, updated_at, updated_by)
VALUES 
  ('registration_open', 'false'::jsonb, timezone('utc'::text, now()), 'system'),
  ('accommodation_open', 'false'::jsonb, timezone('utc'::text, now()), 'system'),
  ('last_updated', '"2026-10-09T00:00:00Z"'::jsonb, timezone('utc'::text, now()), 'system')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

-- 2. Teams (75 Registered Teams)
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '01b6bd40-9090-4072-8d9d-048a17e9f9b5', 'SHF26-M7PYJZ', 'Code Red', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'Liyo Roshan', 'Rathinam Global Deemed to be University', 'Computer Science', '2nd Year', '8590524779', 'liyoroshan2255@gmail.com',
  1000, '663388286417', 'https://drive.google.com/drive/folders/1pfuaxIuadp-mfsPDmOS4Bh_uq7lIvgv0', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-24 15:54:01+00', '2026-09-24 15:54:01+00', '2026-09-24 15:54:01+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '030d3ae5-5b28-4824-853c-17c254259827', 'SHF26-GUPRWC', 'ROTCREW', 4, 'Generative AI', 'Open Innovation', FALSE,
  'POOVARAGAN S', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '8438097795', 'poovaragansiva@gmail.com',
  1000, '663526184379', 'https://drive.google.com/file/d/1BpPFrwWGbrDTp4D7La-FyU6OeFJMMgo1/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-26 15:02:10+00', '2026-09-26 15:02:10+00', '2026-09-26 15:02:10+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '6a34021e-43fb-420b-8ebd-fb312201e8c6', 'SHF26-EHTKRW', 'Koders Club', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Selva Kailash', 'Nehru Institute of Engineering and Technology', 'CSE', '2nd Year', '9360571671', 'selvakailash95@gmail.com',
  1000, '626920388355', 'https://drive.google.com/file/d/1NPILz83WNACyU-MZHpwgJxsyUBhhvqws/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-26 15:37:05+00', '2026-09-26 15:37:05+00', '2026-09-26 15:37:05+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '556509e2-2215-4dfc-936c-a57ce3455c39', 'SHF26-N9TLE9', 'CYBERKNIGHTS', 4, 'Generative AI', 'Open Innovation', FALSE,
  'NITHEESH S', 'NANDHA ENGINEERING COLLEGE', 'CSE', '3rd Year', '9597209882', 'nitheeshnitheeshsanthi@gmail.com',
  1000, '626951092391', 'https://drive.google.com/file/d/17vcSCgP0T9cDahOiGYuTlCMBwFdP16Bq/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-26 16:14:37+00', '2026-09-26 16:14:37+00', '2026-09-26 16:14:37+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '89def07c-1223-488c-95a6-dffa6e6e8ff6', 'SHF26-LBW2X2', 'TEAM INNOVEX', 4, 'Generative AI', 'Open Innovation', FALSE,
  'JAYAKUMAR M', 'SHREE VENKATESHWARA HI-TECH ENGINNERING  COLLEGE', 'B.E CSE CYBER SECURITY', '3rd Year', '9025110991', 'jayakumar.cyber@gmail.com',
  1000, '626923709838', 'https://drive.google.com/file/d/1bt9DDJ6YEkQEyXTSstVQ_dLJs42ViaJe/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-26 16:37:49+00', '2026-09-26 16:37:49+00', '2026-09-26 16:37:49+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '1657ca50-1aa6-462c-b385-302eba69df0c', 'SHF26-S3CHSG', 'INNOVERS', 4, 'Sustainable Development Goals', 'Open Innovation', TRUE,
  'GNANESHWER R', 'PAAVAI ENGINEERING COLLEGE', 'INFORMATION TECHNOLOGY', '3rd Year', '9025948661', 'selvaraju14feb@gmail.com',
  1000, '663529471113', 'https://drive.google.com/file/d/1Y6JdPua9YKa5Ju3cwowLd4HYdREmbosy/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-26 17:18:25+00', '2026-09-26 17:18:25+00', '2026-09-26 17:18:25+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'cdc961de-929f-4e06-801b-47c9c03fffef', 'SHF26-FHUJM8', 'Apex_Go', 4, 'Web3 & FinTech', 'Open Innovation', FALSE,
  'Deepak kumar.D', 'VIT VELLORE', 'Integrated Mtech Software Engineering', '4th Year', '7871538005', 'deepakkumar.d2023@vitstudent.ac.in',
  1000, '627091519574', 'https://drive.google.com/file/d/161IiwBrjt21tNnh4Rsk3CpgFMF6gj8mP/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-27 09:57:27+00', '2026-09-27 09:57:27+00', '2026-09-27 09:57:27+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '56e0acad-0271-4c3f-a27a-751e21c264cf', 'SHF26-GDFZR5', 'Team Billie', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Kirthik raj', 'Sudharsan engineering college', 'AI&DD', '3rd Year', '7604978642', 'rajkirthik6@gmail.com',
  1000, '871146680990', 'https://drive.google.com/file/d/1qha1yMmoYoaW5m6Z7rnLLBjHDqeage59/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-27 14:01:07+00', '2026-09-27 14:01:07+00', '2026-09-27 14:01:07+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '8b02c33b-3665-47ac-b8a8-00dc2e9797fc', 'SHF26-GMFW2M', 'Venture Visionary', 3, 'Digital Prototyping & Design', 'Open Innovation', FALSE,
  'Rizvan R', 'Velalar College of Engineering and Technology', 'Computer Science and Engineering', '2nd Year', '9865252594', 'rizvan2918@gmail.com',
  1000, '627067385190', 'https://drive.google.com/file/d/1XTW-FC-vfPp7mgfbg8OKyCwmVDEhn3pH/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-27 21:27:19+00', '2026-09-27 21:27:19+00', '2026-09-27 21:27:19+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'df0f67da-45cd-44e0-a977-b85aaeaf46c3', 'SHF26-BLJXKG', 'Velora', 2, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'Mathishree.D', 'Vivekanandha College of Engineering For Women', 'Computer Science and Engineering', '2nd Year', '9363799079', 'mathisrimsd008@gmail.com',
  1000, '110775986090', 'https://drive.google.com/file/d/18D8tRxFpdQObkzWDMaJ0Du4icS6HGLCE/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-27 21:32:42+00', '2026-09-27 21:32:42+00', '2026-09-27 21:32:42+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '087bd1f9-61a2-4497-812b-b82f35beb4fc', 'SHF26-VD5V32', 'FortNex', 4, 'Cryptography & Cyber Security', 'Open Innovation', FALSE,
  'Hari Balaji S', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9361985391', 'srinivasanhari072@gmail.com',
  1000, '627118049856', 'https://drive.google.com/file/d/1_kgiWs95CQqVQYCqNW9kKF0TAuvO1sjm/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 10:54:32+00', '2026-09-28 10:54:32+00', '2026-09-28 10:54:32+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'c4b9161e-44af-4c9b-ad29-632a21488011', 'SHF26-9YQS3H', 'GRACE BEES', 2, 'Generative AI', 'Open Innovation', TRUE,
  'J.JOHANNIE RINAH', 'GRACE COLLEGE OF ENGINEERING', 'B.Tech AI-DS', '2nd Year', '8300904611', 'johannierinah3@gmail.com',
  1000, '945469353755', 'https://drive.google.com/file/d/1uWj3eIehuWswa41gV7ufUqQKli939rdV/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 18:06:19+00', '2026-09-28 18:06:19+00', '2026-09-28 18:06:19+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '64a064cc-d949-478d-b123-5ef95d26c34e', 'SHF26-XJL2ZX', 'CODE TECH', 2, 'Generative AI', 'Open Innovation', FALSE,
  'S.NOBHIN ARTHURS', 'KARUNYA INSTITUTION OF TECHNOLOGY AND SCIENCES', 'B.Tech AI-DS', '2nd Year', '9095054661', 'nobhinarthurs@gmail.com',
  1000, '614288715567', 'https://drive.google.com/file/d/1LynWjgUjgDFm7F_hhGxiQLN0VYBMH-ep/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 18:31:11+00', '2026-09-28 18:31:11+00', '2026-09-28 18:31:11+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '4826c9ab-ca08-497f-adaf-0f71f5bcd912', 'SHF26-NGPY5G', 'Dream Weavers', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'V.Abivarnisha', 'Paavai Engineering College', 'AI&DS', '3rd Year', '6380190048', 'vimalasada1940@gmail.com',
  1000, '627156377151', 'https://drive.google.com/file/d/1hPPmei6rA0haHYKeoBtIPD0lYt7GxUS4/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 20:39:55+00', '2026-09-28 20:39:55+00', '2026-09-28 20:39:55+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'f85b29bd-a033-40fc-b50d-978b5134a1d4', 'SHF26-7GMFU4', 'Core Titan', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'Santhosh.V', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '9042320295', 'santhoshvvnr@gmail.com',
  1000, '237267351313', 'https://drive.google.com/file/d/1nF1uSwq52Lkt9ODSgOFMsQZ6APl2YNzv/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 20:49:39+00', '2026-09-28 20:49:39+00', '2026-09-28 20:49:39+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'd0b225dd-5b92-4dca-b854-4d747291ce27', 'SHF26-5DKEC8', 'Tech Titans', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'SRI RAMJI B', 'Knowledge Institute of Technology', 'B.E. Computer Science and Engineering', '2nd Year', '8807664984', '2k25cse210@kiot.ac.in',
  1000, '627157478555', 'https://drive.google.com/file/d/1zxrvJ2FnUEfev4Vx9jf-HkpUBAGD8C3S/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 20:56:55+00', '2026-09-28 20:56:55+00', '2026-09-28 20:56:55+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '606b654c-f96f-4155-a5f5-2fb0c601ac7a', 'SHF26-ULDTWC', 'TechZen', 4, 'Digital Prototyping & Design', 'Open Innovation', FALSE,
  'Subhashree S', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '8438563511', 'subhashreesenthilkumarpn@gmail.com',
  1000, '663739598521', 'https://drive.google.com/file/d/1udGtdON4wKtFOK1OGQi8hhDMT0EpC_sE/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 21:40:43+00', '2026-09-28 21:40:43+00', '2026-09-28 21:40:43+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'ab53412d-0963-4543-a1a1-79fdc5f20b54', 'SHF26-APXMDF', 'Techpluse', 4, 'Generative AI', 'Open Innovation', FALSE,
  'RITHIKA', 'SNS COLLEGE OF TECHNOLOGY', 'It', '2nd Year', '6369078416', 'rithikavk01@gmail.com',
  1000, '143241476998', 'https://drive.google.com/file/d/1EYROMmLoodGwNPI9e47Zm6hTeMtA38H_/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-28 21:50:06+00', '2026-09-28 21:50:06+00', '2026-09-28 21:50:06+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '62ddbd5d-147b-4e04-9ef1-b2a174a079c4', 'SHF26-LJTG9Z', 'Code Zilla', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'MAHESHWARI S', 'Shree Venkateshwara hi tech engineering college', 'Computer science and engineering', '3rd Year', '9942125851', 'maheshwaricse03@gmail.com',
  1000, '627279915531', 'https://drive.google.com/file/d/1KIFXEUMy3aswIQZZGnT6tpziXLEqYEa2/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 12:09:12+00', '2026-09-29 12:09:12+00', '2026-09-29 12:09:12+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'ddca8e41-5aba-4f96-b4c9-6e37733f2cd1', 'SHF26-MSP8MK', 'ZypherX', 4, 'Cryptography & Cyber Security', 'Open Innovation', FALSE,
  'PRASANNA KUMAR SR', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9150204546', 'prasannakumarlh344@gmail.com',
  1000, '627291485371', 'https://drive.google.com/file/d/1Ef-V47aiRihqQObv7ehIUzDeFb77KjPp/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 15:31:15+00', '2026-09-29 15:31:15+00', '2026-09-29 15:31:15+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '860710a5-f139-4e44-aac0-5094c6d5b07f', 'SHF26-DXXGFJ', 'Cosmic', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'Madhuvanthi S', 'Erode sengunthar engineering college', 'Computer Science and Engineering', '3rd Year', '8870244140', 'madhuvanthi229@gmail.com',
  1000, '627203172494', 'https://drive.google.com/file/d/15A53zSeqB9lk_-43etvTMRxNc4745Ua-/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 19:03:57+00', '2026-09-29 19:03:57+00', '2026-09-29 19:03:57+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '666538d6-5cfb-4848-aa74-bd5e6cde05a7', 'SHF26-ZRCZ6Q', 'Innovexa', 3, 'Generative AI', 'Open Innovation', FALSE,
  'S kanishka', 'Dr. Mahalingam college of engineering and technology', 'Information technology', '3rd Year', '9894368150', 'skanishka2024@gmail.com',
  1000, '627254798606', 'https://drive.google.com/file/d/1QGxxralPg4LeXoH6x5rDpltu_24fglhY/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 20:46:19+00', '2026-09-29 20:46:19+00', '2026-09-29 20:46:19+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'bd0f49b3-de58-44b6-ae44-778f9817cf3b', 'SHF26-AUFMG6', 'Hackovators', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Rathimeena V', 'Dr.Mahalingam College of Engineering and Technology', 'Information Technology', '3rd Year', '9025642562', 'rathimeena6677@gmail.com',
  1000, '663890343716', 'https://drive.google.com/file/d/1oBgmoTv7z9KRuElIGJ6LDBbUFP0N6bFi/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 20:48:07+00', '2026-09-29 20:48:07+00', '2026-09-29 20:48:07+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'd027f2d3-86c8-499d-ba93-f9014c531261', 'SHF26-6F7SKH', 'Innovate_X', 3, 'Digital Prototyping & Design', 'Open Innovation', FALSE,
  'ABISHEK P', 'KPR INSTITUTE OF ENGINEERING & TECHNOLOGY', 'B. TECH ARTIFICIAL INTELLIGENCE AND DATA SCIENCE', '3rd Year', '8489302266', '25adl01@kpriet.ac.in',
  1000, '627216417124', 'https://drive.google.com/file/d/1pKe5xxojJmiulp2047Q6ph3_dvvbWJDM/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 21:23:59+00', '2026-09-29 21:23:59+00', '2026-09-29 21:23:59+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '84d9f327-e32c-49cc-bdbb-08f238ade97b', 'SHF26-EP5YWT', 'Pirates', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Lanitha shree K', 'Erode Sengunthar Engineering college', 'Computer science and engineering', '3rd Year', '9095019731', 'lanithakaruppusamy@gmail.com',
  1000, '663893811360', 'https://drive.google.com/file/d/1VjgerKoqs58iiOhAaCznoPfeheXTe2Fb/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 21:28:03+00', '2026-09-29 21:28:03+00', '2026-09-29 21:28:03+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'fb3cd4f8-122d-449f-a4b2-9add96799566', 'SHF26-9C78BM', 'SPARK SHIFT', 3, 'Digital Prototyping & Design', 'Open Innovation', FALSE,
  'SRIJANE JN', 'KPR INSTITUTE OF ENGINEERING & TECHNOLOGY', 'B. TECH AIDS', '3rd Year', '9047056070', 'srijanejn06@gmail.com',
  1000, '627217193615', 'https://drive.google.com/file/d/1z5A7xzKhtFfeW_cRa4r9-ZsLvZcvOTrL/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 21:36:48+00', '2026-09-29 21:36:48+00', '2026-09-29 21:36:48+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'be14d739-ec1d-4dde-85c1-0dbdb14f2fe3', 'SHF26-SV427F', 'saveetha coders', 3, 'Generative AI', 'Open Innovation', FALSE,
  'Raksha P V', 'SIMATS Engineering (Saveetha School Of Engineering)', 'Biomedical Engineering', '4th Year', '7806957556', 'rakshapv9016.sse@saveetha.com',
  1000, '663813962679', 'https://drive.google.com/file/d/1_FwikLw4ftbOjqUJYXtxeysDdLcnW88j/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 23:07:18+00', '2026-09-29 23:07:18+00', '2026-09-29 23:07:18+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '9b62cff2-455c-4dae-97de-4886e1109a97', 'SHF26-3UQ34W', 'Code Blooded', 3, 'Generative AI', 'Open Innovation', FALSE,
  'Harini.R', 'Saveetha School of Engineering', 'Biomedical Engineering', '4th Year', '6380534848', 'harurav456@gmail.com',
  1000, '663816208002', 'https://drive.google.com/file/d/1SOYPgSOsHmQnRANB7MQhkKygkMcZz7kB/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-29 23:31:48+00', '2026-09-29 23:31:48+00', '2026-09-29 23:31:48+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '927877ed-beb7-4325-8366-8c6cadd47cea', 'SHF26-J3XU8K', 'Virtual Warriors', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'DEEPAKUMAR.S', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '7358820428', 'skdeepakumar000@gmail.com',
  1000, '615041375867', 'https://drive.google.com/file/d/1h1hxRtKSC_TepqdniAgbE-d4eTVJqIOg/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-30 11:28:56+00', '2026-09-30 11:28:56+00', '2026-09-30 11:28:56+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'e17a9703-fdd5-4cd0-9590-13f07aec7592', 'SHF26-DTJLYJ', 'Battle Warriors', 4, 'Generative AI', 'Open Innovation', FALSE,
  'vishal T', 'Nehru Institute of Engineering and Technology', 'Computer Science Engineering', '2nd Year', '9791679489', 'vishal2006t@gmail.com',
  1000, '663912424429', 'https://drive.google.com/file/d/1T7trfXmfkBollaE_Wp5NM8llOK-mosR8/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-30 11:36:01+00', '2026-09-30 11:36:01+00', '2026-09-30 11:36:01+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'f16cd3a0-00bd-458d-940d-9183cab81c45', 'SHF26-K6RB49', 'CODEX', 4, 'Digital Prototyping & Design', 'Open Innovation', TRUE,
  'GANGOTRI K', 'SHREE VENKATESWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '9080406255', 'gangojay3@gmail.com',
  1000, '663900213349', 'https://drive.google.com/file/d/1bQpzwPTLyKcX5yGIdt17jUfgZXIh_gYc/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-30 12:17:04+00', '2026-09-30 12:17:04+00', '2026-09-30 12:17:04+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '12d4e778-727e-4918-8a5a-6c4c10c44d64', 'SHF26-TEJZK6', 'TEAM BEGINNER''S', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'PRADEEPA S', 'Muthayammal engineering college rasipuram', 'CSE', '3rd Year', '8695531647', 'Pradeepashanmugam1214@gmail.com',
  1000, '627387424166', 'https://drive.google.com/file/d/1auBVf9MJ7G3mRh2k2cBxWDd17XiFQ-GD/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-30 18:09:39+00', '2026-09-30 18:09:39+00', '2026-09-30 18:09:39+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'ae3ac5b1-6e7f-48a9-88e0-04a7535108fe', 'SHF26-YRHTKG', 'Alpha Coders', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Subiksha C', 'Karpagam College of Engineering', 'CSE', '2nd Year', '8122625618', 'subichan18@gmail.com',
  1000, '627367702438', 'https://drive.google.com/file/d/1KL5BEFTLlncyM4yJvjjIqlCIK1YDI5R-/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-30 21:46:17+00', '2026-09-30 21:46:17+00', '2026-09-30 21:46:17+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'c0020bec-35fc-44dc-83b0-fe045c7164b6', 'SHF26-TGHUX5', 'NEURO NOVA', 3, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'DEVADHARSHINI K', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'COMPUTER SCIENCE AND ENGINEERING', '3rd Year', '9942507343', 'kdevadharshini1405@gmail.com',
  1000, '627352929048', 'https://drive.google.com/file/d/1hoClhKFQQ-XIiq4zVUGuKNIGYxEtFfGW/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-09-30 21:56:09+00', '2026-09-30 21:56:09+00', '2026-09-30 21:56:09+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '71d011c1-4c07-4456-9221-5c39078cbdfb', 'SHF26-8X72FU', 'Maverick  Nexus', 4, 'Web3 & FinTech', 'Open Innovation', FALSE,
  'DHANUSHKUMAR G', 'Hindusthan college of Arts and Science', 'Information Technology', '2nd Year', '9345590559', 'dhanushkumaramk@gmail.com',
  1000, '627418038262', 'https://drive.google.com/file/d/1H85hpAArbnZlI-M5tNgb8fxv39RsrRRA/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 00:54:17+00', '2026-01-10 00:54:17+00', '2026-01-10 00:54:17+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '05474ad4-9f39-43f5-86ae-291728e5d0ce', 'SHF26-8YDJYE', 'TechNova', 4, 'Digital Prototyping & Design', 'Open Innovation', FALSE,
  'Soshiha RV', 'Knowledge institute of technology', 'Computer Science and engineering', '2nd Year', '8754213899', '2k25cse208@kiot.ac.in',
  1000, '627449306793', 'https://drive.google.com/file/d/1-xBWWqGJPwx_m5BVSfkP8fK7Kj0tu_sG/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 08:57:04+00', '2026-01-10 08:57:04+00', '2026-01-10 08:57:04+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '8f423e82-f09b-40de-a9b0-61f15d499e83', 'SHF26-VZTVRX', 'zentro', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Anbuchelvan.N.K', 'RATHINAM TECHNICAL CAMPUS', 'B-TECH - INFORMATION TECHNOLOGY', '3rd Year', '9486794535', 'anbuchelvan2829@gmail.com',
  1000, '627450011259', 'https://drive.google.com/file/d/1kltA_VQeCZg4ofecRAlYiYlRUyKtcfvi/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 10:06:45+00', '2026-01-10 10:06:45+00', '2026-01-10 10:06:45+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'f98c528a-be86-4422-bb18-0e1f26de60fb', 'SHF26-F2X7SU', 'Techtiden', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'Vinoba Rosi W', 'SSM Institute of Institute of Engineering & Technology,Dindigul', 'B.Tech-AI&DS', '2nd Year', '8148482640', 'vinobarosi@gmail.com',
  1000, '362665100962', 'https://drive.google.com/file/d/1_u9OBh_kpH9NWZRQMYmuWgrARFfm5ZeH/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 12:29:22+00', '2026-01-10 12:29:22+00', '2026-01-10 12:29:22+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'dc6bed68-c577-45f0-adeb-bd309082f003', 'SHF26-MXPJGQ', 'Peaky Blinders', 3, 'Generative AI', 'Open Innovation', FALSE,
  'Dhanushkumar Sekar', 'Coimbatore Institute of Engineering and Technology', 'Computer Science Engineering', '3rd Year', '9894701466', 'kdhanush484@gmail.com',
  1000, '627468645084', 'https://drive.google.com/file/d/1AuPvdGyCDBwfiwCOSNQaqjc0shO0_nRF/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 13:08:51+00', '2026-01-10 13:08:51+00', '2026-01-10 13:08:51+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'be7265f6-271c-44da-ad68-ccb79183798d', 'SHF26-CE9ST6', 'Glow Stack', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Rohith kanna J R', 'Nandha Engineering College', 'Computer science and engineering', '3rd Year', '8438532377', '24csl24@nandhaengg.org',
  1000, '627461355342', 'https://drive.google.com/file/d/1qUBWf5BdYPxoR6GAHqYuRUJDEmDQ82d5/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 13:11:18+00', '2026-01-10 13:11:18+00', '2026-01-10 13:11:18+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '0e490975-3079-4456-baa0-91f67f650992', 'SHF26-5UCTEA', 'Nexthub', 4, 'Generative AI', 'Open Innovation', TRUE,
  'Gavutham G', 'Vellore Institute of Technology, Vellore', 'Integrated Mtech software Engineering', '4th Year', '6380575200', 'gavutham07@gmail.com',
  1000, '627478034802', 'https://drive.google.com/file/d/1JcCq6xpLQgQGFtb88hZ3m_rs2jEhR_2r/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 13:48:28+00', '2026-01-10 13:48:28+00', '2026-01-10 13:48:28+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '5b27b595-893e-423f-9baf-259f302fb172', 'SHF26-SBATU3', 'The Debuggers', 4, 'Generative AI', 'Open Innovation', TRUE,
  'Sanjay J', 'Vellore Institute of Technology', 'Integrated M.tech Software Engineering', '4th Year', '9626654991', 'sanjayjothilingam@gmail.com',
  1000, '627406165136', 'https://drive.google.com/file/d/1FCEkbwBvtn4I_KLZMxuDIAUlQxziUk56/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 13:58:37+00', '2026-01-10 13:58:37+00', '2026-01-10 13:58:37+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'eef5771d-0efc-4531-9f2c-959d18dd0b13', 'SHF26-P7LXXQ', 'Vision forge', 4, 'Digital Prototyping & Design', 'Open Innovation', FALSE,
  'Sandhiya C', 'Velalar college of engineering and technology', 'BE-CSE', '2nd Year', '6383361685', 'imsand108@gmail.com',
  1000, '627418467369', 'https://drive.google.com/file/d/1QuR26YpAyLUaBY8w5PT4syRpABRDX1b5/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 14:00:40+00', '2026-01-10 14:00:40+00', '2026-01-10 14:00:40+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '4a06f8f2-7067-4d51-b038-2e49f35a3383', 'SHF26-LDXURB', 'DecodeX', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'Jasima Firadouse', 'Dhaanish ahmed institute of technology', 'Cse', '4th Year', '9363207104', 'jasimafiradouse@gmail.com',
  1000, '005528711410''', 'https://drive.google.com/file/d/1vIVBoqrvyiSGr2ORSOquemZT0XtbkRg0/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 14:09:31+00', '2026-01-10 14:09:31+00', '2026-01-10 14:09:31+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '2a601fcf-f367-4e61-ad08-d9ca49a9f2fd', 'SHF26-CWSF6E', 'MindTheGap', 3, 'Sustainable Development Goals', 'Open Innovation', TRUE,
  'M Kaarthik', 'Vellore Institute Of Technology', 'Integrated MTech in Software Engineering', '4th Year', '9884278269', 'kaarthik.m2005@gmail.com',
  1000, '627406531922', 'https://drive.google.com/file/d/1vBeVs6cKqjYhZ_RCmLkgCVwsypEBF5t0/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 14:11:44+00', '2026-01-10 14:11:44+00', '2026-01-10 14:11:44+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '629a5b45-2f7e-43e4-9390-0ed7c9c353a9', 'SHF26-W98A2E', 'Zyventra', 4, 'Sustainable Development Goals', 'Open Innovation', FALSE,
  'CHINNADURAI C', 'K.S.R College of Engineering', 'B.Tech IT', '2nd Year', '8015508286', 'chinnadurai8015@gmail.com',
  1000, '615131677130', 'https://drive.google.com/file/d/1AOGNMKeqH8KHDf4mPNuzI3-jZcE-PQX7/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 17:54:42+00', '2026-01-10 17:54:42+00', '2026-01-10 17:54:42+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '5472dbe4-189c-414c-badf-b3df5494dfbb', 'SHF26-U965EB', 'Cognix', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Gokulnath A', 'Rathinam Technical Campus', 'B.Tech-IT', '3rd Year', '7603939041', 'msdgokul1407@gmail.com',
  1000, '664008546471', 'https://drive.google.com/file/d/1GVwJ4KyHMTOZ6gEZbHSBb_vEBM_mGzj-/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 20:12:27+00', '2026-01-10 20:12:27+00', '2026-01-10 20:12:27+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '0ac1038f-b9bf-41af-85a8-55f6102720f0', 'SHF26-SBJUXT', 'rule breakerz', 4, 'Generative AI', 'Open Innovation', FALSE,
  'Bhuvanesh S', 'kpr institute of engineering', 'CSE', '2nd Year', '9344479803', 'bhuvanesh2604.s@gmail.com',
  1000, '740051471644', 'https://drive.google.com/file/d/1iMWNIqwTEmHKzW6PyA4c9A3ZN8S_gc9U/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-01-10 22:07:46+00', '2026-01-10 22:07:46+00', '2026-01-10 22:07:46+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'c40f3574-d14f-429b-bbe4-707d02619f6b', 'SHF26-YVWPW5', 'QUAD-A CODERS', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'ABISEK P', 'Dhanalakshmi Srinivasan college of engineering, coimbatore', 'B.E.CSE', '2nd Year', '9943558866', 'abisekp25@dsce.ac.in',
  1000, '664048536114', 'https://drive.google.com/file/d/1aDPkJO54ALcv9fCwSot-X6P5FH7rp3iO/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-01 23:28:37+00', '2026-10-01 23:28:37+00', '2026-10-01 23:28:37+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '9f9fc2d3-2b99-47f1-8a47-0aa6761d59f1', 'SHF26-AX3BAB', 'Code Crafters', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'Manyanthra M S', 'Kumaraguru College of Technology', 'CSE', '3rd Year', '8883337722', 'manyanthra@gmail.com',
  1000, '664159641367', 'https://drive.google.com/file/d/1XFvUrSK7AxN7-hAJEzA273FmlYpBSYfJ/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 11:00:54+00', '2026-10-02 11:00:54+00', '2026-10-02 11:00:54+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'fc9d43bb-c77e-41e5-8764-a577d0506e58', 'SHF26-FK7ES9', 'Nexora', 4, 'Digital Prototyping & Design', 'General Track', FALSE,
  'Sabari K', 'Velalar college of engineering and technology', 'Computer science and engineering', '2nd Year', '6383881558', 'sabarikanagaraj.ndk@gmail.com',
  1000, '664128849713', 'https://drive.google.com/file/d/12QgKKlz_awodBe_iw2xJXBwd6zdEdHft/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 12:14:04+00', '2026-10-02 12:14:04+00', '2026-10-02 12:14:04+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'c2d6966b-cb21-4247-a113-b309a171e2bb', 'SHF26-K28RL4', 'Vortex', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'SANJAY M', 'SNS College of Technology', 'Computer Science and Engineering', '1st Year', '9894190270', 'sanjay689thechampion@gmail.com',
  1000, '627541681006', 'https://drive.google.com/file/d/1HgMfmMTQ-enPHHjUol-Tf5h0DVLwpwvS/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 12:37:45+00', '2026-10-02 12:37:45+00', '2026-10-02 12:37:45+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '1f444940-9073-4da3-b2ce-7df1b473d4f6', 'SHF26-V5XT63', 'Sync3', 3, 'Cryptography & Cyber Security', 'General Track', FALSE,
  'SHREE LAKSHITHA S', 'KPR INSTITUTE OF ENGINEERING AND TECHNOLOGY', 'CSE', '2nd Year', '8056450637', 'lakshitha0506@gmail.com',
  1000, '664128939699', 'https://drive.google.com/file/d/1Yj6pe3FD8JHh1a9DonYlLQo7mxhc0NT6/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 12:49:34+00', '2026-10-02 12:49:34+00', '2026-10-02 12:49:34+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'adbe08aa-2b67-43b5-8b7a-06e0627c9bee', 'SHF26-YYBMRS', 'Cyra tech', 4, 'Generative AI', 'General Track', FALSE,
  'Thirumurugan S', 'Sasurie college of engineering', 'Cybersecurity', '2nd Year', '6385337412', 'sthirumurugan161@gmail.com',
  1000, '664117967510', 'https://drive.google.com/file/d/19c9A3Sb9sJgcj6kWe-AmG7jvIgKVeNxH/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 13:33:49+00', '2026-10-02 13:33:49+00', '2026-10-02 13:33:49+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'fbf46630-119c-4d04-abb2-af889b0a8999', 'SHF26-QHYP6Z', 'Team Nexora', 4, 'Generative AI', 'General Track', FALSE,
  'Harunya K', 'NPR college of Engineering and Technology', 'BE CSE', '3rd Year', '8110015477', 'harunyak583224104038@nprcolleges.org',
  1000, '664187571041', 'https://drive.google.com/file/d/1CHF00DseAx_v9q3ZDRb7uTXBBL4M51WR/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 14:25:29+00', '2026-10-02 14:25:29+00', '2026-10-02 14:25:29+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '0e893d86-861d-4db1-8ace-866418eed506', 'SHF26-Z38MLA', 'Codeverse', 4, 'Generative AI', 'General Track', FALSE,
  'Adila haseen', 'NPR college of engineering', 'CSE', '3rd Year', '8098946410', 'adilahaseen583224104002@nprcolleges.org',
  1000, '664100605547', 'https://drive.google.com/file/d/1cxvD-yeLLZq6X2xvxg4I3eIhm8PTgtMs/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 15:02:25+00', '2026-10-02 15:02:25+00', '2026-10-02 15:02:25+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '55e100b8-b217-452a-861f-a63e9be3420d', 'SHF26-L2V255', 'Code builder', 4, 'Generative AI', 'General Track', FALSE,
  'VISHNU U', 'NPR COLLEGE OF ENGINEERING AND TECHNOLOGY', 'CSE', '3rd Year', '8300973914', 'vishnuu583224104120@nprcolleges.org',
  1000, '627566334340', 'https://drive.google.com/file/d/1qHB64KjwsOikF0D5ciIXcMwVGTMOmw1O/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 15:14:58+00', '2026-10-02 15:14:58+00', '2026-10-02 15:14:58+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '5b7a691a-1f4f-4b87-be0e-53438efc7bbb', 'SHF26-SWKZCG', 'Team Endeavours', 4, 'Generative AI', 'General Track', FALSE,
  'Srirangapprasath I', 'Rathinam Technical Campus, Coimbatore.', 'AI&DS', '2nd Year', '7639907884', 'rangapprasathsri@gmail.com',
  1000, '181945551452', 'https://drive.google.com/file/d/1MbePdgYJWfnKfDmr773hhukKPyL3Vnlc/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 18:21:12+00', '2026-10-02 18:21:12+00', '2026-10-02 18:21:12+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '60998cc3-2f5e-4b9b-a564-3468c012bb69', 'SHF26-ZBR9RG', 'Project Chaos', 4, 'Digital Prototyping & Design', 'General Track', FALSE,
  'SURIYAKUMAR E', 'RATHINAM TECHNICAL CAMPUS', 'BE CSE(AIML)', '2nd Year', '9445648373', 'suryaaswin000@gmail.com',
  1000, '627578561627', 'https://drive.google.com/file/d/1oeg4UlmKNG_UDB-oUVuxQtorN9ANYlv3/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-02 18:22:03+00', '2026-10-02 18:22:03+00', '2026-10-02 18:22:03+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'e7ab6bed-d501-4349-aab9-bda1e3b5503b', 'SHF26-YDRZGN', 'BYTE BRAINS', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'DURGA DEVI R', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '8015674318', 'durgadevir25@dsce.ac.in',
  1000, '130461034057', 'https://drive.google.com/file/d/1upL9210IrBw0RBgLPG9RYg2Eyi0O5sd5/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-03 10:59:45+00', '2026-10-03 10:59:45+00', '2026-10-03 10:59:45+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '69cc9407-5f4e-4fb3-b840-09f22976fdcb', 'SHF26-Z2Q8HY', 'Tag Coders', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'Gowres M S', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '9952712633', 'mgowres@gmail.com',
  1000, '664376975291', 'https://drive.google.com/file/d/1EhyZ3HstvwS-qOEHFpKGsnzn9Pw4rYSu/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-04 18:17:16+00', '2026-10-04 18:17:16+00', '2026-10-04 18:17:16+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '23a0f15b-0384-4061-8d5f-b1d3fc98f0ee', 'SHF26-7F8L3E', 'Codenova', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'Priyadharshini A', 'Dr.NGP Institute of Technology', 'Computer science and engineering', '2nd Year', '7200928794', 'priyadharshini00102@gmail.com',
  1000, '627868140870', 'https://drive.google.com/file/d/10rDix-KjZnMf0OyifMxZN5Ii3_egcIGY/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 12:56:46+00', '2026-10-05 12:56:46+00', '2026-10-05 12:56:46+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'c0518126-5b99-473d-a086-5bb6fd40b211', 'SHF26-9Y4H32', 'TECH NOVA TWO', 4, 'Web3 & FinTech', 'General Track', FALSE,
  'KOKILA B', 'Shree Venkateshwara hi-tech engineering college', 'CSE', '3rd Year', '7845625667', 'kokilakokila5768@gmail.com',
  1000, '627810722898', 'https://drive.google.com/file/d/10B457GRHmSCUEiGZnfOAYVYxjCqV-xYW/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 12:59:19+00', '2026-10-05 12:59:19+00', '2026-10-05 12:59:19+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '326c830e-9238-4789-adde-5179e080c00b', 'SHF26-AT7XC7', 'Rufus', 3, 'Sustainable Development Goals', 'General Track', FALSE,
  'Aashif K', 'Dhanalakshmi Srinivasan college of engineering', 'Computer science and engineering', '2nd Year', '8015107191', 'aashif2182007@gmail.com',
  1000, '627822942286', 'https://drive.google.com/file/d/1pmikN2F4Z98CNMp0QMmJSq8QWUxCrKW0/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 13:00:58+00', '2026-10-05 13:00:58+00', '2026-10-05 13:00:58+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'eea26f95-b17e-415e-a2f2-5682277da47c', 'SHF26-XXNWCP', 'TECH TETRA', 4, 'Generative AI', 'General Track', FALSE,
  'HEMALATHA C', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '8122217018', 'chemalatha382@gmail.com',
  1000, '627832187871', 'https://drive.google.com/file/d/1oK6Y54pymb86-KL3CaYSsVqNjms49_tJ/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 13:33:04+00', '2026-10-05 13:33:04+00', '2026-10-05 13:33:04+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '9952b707-565a-40e6-b091-eada0e82b9fc', 'SHF26-U54R2N', 'MAVERICK', 3, 'Generative AI', 'General Track', FALSE,
  'SAISARAN V', 'HINDUSTHAN COLLEGE OF ENGINEERING AND TECHNOLOGY', 'COMPUTER SCIENCE ENGINEERING', '1st Year', '7598019719', 'saisaran000777@gmail.com',
  1000, '627891245646', 'https://drive.google.com/file/d/15KfnonQulnYnwPZwrxrmd8KVChO1IgDx/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 13:36:14+00', '2026-10-05 13:36:14+00', '2026-10-05 13:36:14+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '17ad3ef3-cacd-49db-b1e3-f6941af68eba', 'SHF26-RWSB64', 'Debugging Legends', 4, 'Generative AI', 'General Track', FALSE,
  'kaniksha S', 'Shree Venkateswara hi-tech Engineering College', 'B.E computer science and Engineering', '3rd Year', '8111064688', 'kanikshakani047@gmail.com',
  1000, '627804436610', 'https://drive.google.com/file/d/1pn_7-TJFHGjNkk4LCZF6RqfzMPKURqQ1/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 13:39:10+00', '2026-10-05 13:39:10+00', '2026-10-05 13:39:10+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'b2257597-50b2-4208-8e0e-637dc2f7ce6e', 'SHF26-54W9ZT', 'CodeNova 1', 3, 'Web3 & FinTech', 'General Track', FALSE,
  'Abinayasree A', 'Shree Venkateswara Hi tech Engineering college', 'BE CSE', '3rd Year', '9025666340', 'abinayasri749@gmail.com',
  1000, '664401770785', 'https://drive.google.com/file/d/1YD48KnZjw08DE4Z79vuQ19Vj1RSuDZiZ/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 13:54:28+00', '2026-10-05 13:54:28+00', '2026-10-05 13:54:28+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'e2345cb9-c91b-4e38-ab84-afb22067b073', 'SHF26-N3XSYQ', 'Spark Arise', 3, 'Web3 & FinTech', 'General Track', FALSE,
  'Thulasidharsan V', 'Mahendra Institute of technology', 'BE EEE', '3rd Year', '9791512551', 'thulasidharsan007@gmail.com',
  1000, '627843227523', 'https://drive.google.com/file/d/1L1gOpXXeQ-OzYSrsOYTbrSL0aAQU5B1U/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 16:35:03+00', '2026-10-05 16:35:03+00', '2026-10-05 16:35:03+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '005b4103-d87f-4915-a3aa-364a43bedadb', 'SHF26-LWQYAQ', 'Codecraft', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'SHACHIN A', 'Dhanalakshmi Srinivasan college of engineering coimbatore', 'Btech ai&ds', '2nd Year', '6382906526', 'shachin705@gmail.com',
  1000, '627893382071', 'https://drive.google.com/file/d/17uf2_RYB9vR1ntZlCoRSaYF6UefQw50u/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 17:44:21+00', '2026-10-05 17:44:21+00', '2026-10-05 17:44:21+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'ab1f1059-cb57-4f23-a117-c18f6e6f4b7d', 'SHF26-GF859Q', 'Neural nexus', 4, 'Generative AI', 'General Track', FALSE,
  'A.Arshun Noufiya', 'KPR institute of engineering and technology', 'Artificial intelligence and data', '2nd Year', '8778793367', '25ad015@kpriet.ac.in',
  1000, '627875273524', 'https://drive.google.com/file/d/1xF8vXGdokQ0_-jsndar0earwcN2H1G90/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 17:53:38+00', '2026-10-05 17:53:38+00', '2026-10-05 17:53:38+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '713580c1-d246-4327-85d3-d3f921e987af', 'SHF26-XM73ED', 'Synovate', 3, 'Generative AI', 'General Track', FALSE,
  'ARAVINDHAN S', 'ERODE SENGUNTHAR ENGINEERING COLLEGE', 'ELECTRICAL AND ELECTRONICS ENGINEERING', '3rd Year', '6381944469', 'aravindhanofficial83@gmail.com',
  1000, '627882489382', 'https://drive.google.com/file/d/1AhJCupyE8bkPXraCROf6r_vKxfNBkm3Y/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 18:10:47+00', '2026-10-05 18:10:47+00', '2026-10-05 18:10:47+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  'fa06c63f-b6a4-493e-beb9-a73e03f58fa3', 'SHF26-75JEZD', 'Logic Finders', 4, 'Digital Prototyping & Design', 'General Track', FALSE,
  'Dhanush RJ', 'KLN college of engineering', 'Information technology', '3rd Year', '9361820110', 'dhanushrj3906@gmail.com',
  1000, '627878991519', 'https://drive.google.com/file/d/1weB9L36pDGH5QcUEnsWegNF9XQP9KiLp/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 18:35:52+00', '2026-10-05 18:35:52+00', '2026-10-05 18:35:52+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '4ba72158-c51d-4c6c-9785-a73de33a0e31', 'SHF26-22HCPD', 'Quantum Coders', 4, 'Generative AI', 'General Track', FALSE,
  'Dharshini Sri R', 'K.L.N College of Engineering', 'Information Technology', '3rd Year', '9092636338', 'dharshinisri23052007@gmail.com',
  1000, '627860799713', 'https://drive.google.com/file/d/123w8EqjyP3EB0YL7qDEbkwgmTLOQ_dEV/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 18:59:04+00', '2026-10-05 18:59:04+00', '2026-10-05 18:59:04+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '7a5c9245-7ce0-42a8-9b8f-876c6db40e0c', 'SHF26-Y97R82', 'Tech Vibe', 4, 'Sustainable Development Goals', 'General Track', FALSE,
  'Sugapriya S', 'K.L.N.College Of Engineering', 'Information Technology', '3rd Year', '9843702299', 'sugapriya2706@gmail.com',
  1000, '627805197732', 'https://drive.google.com/file/d/1WEuQbTvIdADqEijbYu2mnb7tvA4drUHG/view?usp=drivesdk', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-05 19:02:37+00', '2026-10-05 19:02:37+00', '2026-10-05 19:02:37+00'
) ON CONFLICT (team_code) DO NOTHING;
INSERT INTO public.teams (
  id, team_code, team_name, team_size, selected_domain, selected_theme, accommodation_required,
  leader_name, leader_college, leader_department, leader_year, leader_whatsapp, leader_email,
  payment_amount, upi_transaction_id, payment_screenshot_url, payment_status, registration_status,
  email_status, registration_timestamp, created_at, updated_at
) VALUES (
  '24c8b91a-7b3c-4e8f-9a1d-72e485a9f3b1', 'SHF26-KLM87U', 'Nexora', 4, 'Generative AI', 'General Track', FALSE,
  'Muthukumar G', 'Paavai Engineering College', 'B.Tech - Information Technology', '3rd Year', '7868093944', 'muthusarankcy123@gmail.com',
  1000, '627581948940', 'https://drive.google.com/file/d/1iCbX9kkF07EF2OO1ovhxS-Wdk04JSqBX/view?usp=sharing', 'PENDING', 'CONFIRMED',
  'SENT', '2026-10-08 23:48:56+00', '2026-10-08 23:48:56+00', '2026-10-08 23:48:56+00'
) ON CONFLICT (team_code) DO NOTHING;

-- 3. Team Members (283 Participants)
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4cee15e1-7ffc-4037-9f8f-d49b1ee2aa15', '01b6bd40-9090-4072-8d9d-048a17e9f9b5', 1, 'Liyo Roshan', 'Rathinam Global Deemed to be University', 'Computer Science', '2nd Year', '8590524779', 'liyoroshan2255@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '64c7a03a-5b81-4127-8821-4a1654a30e71', '01b6bd40-9090-4072-8d9d-048a17e9f9b5', 2, 'Bagyaprem', 'Rathinam Technical Campus', 'Computer science engineering', '4th Year', '6374005564', 'prembagya822@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0abdc618-1c65-4c28-b33e-6c03d98fbd71', '01b6bd40-9090-4072-8d9d-048a17e9f9b5', 3, 'Mariya Nenot R', 'Rathinam Global Deemed to be University', 'Data Science and Business Analytics', '1st Year', '8525814304', 'mariyanenot1802@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c6cb14aa-d360-49d0-a95c-062426382816', '01b6bd40-9090-4072-8d9d-048a17e9f9b5', 4, 'Kanishkar SP', 'Rathinam Technical Campus', 'Electronics and Communication Engineering', '3rd Year', '9344125675', 'kanishkar.sp@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b2326c19-6797-49ea-bbf9-0d3197c49fb0', '030d3ae5-5b28-4824-853c-17c254259827', 1, 'POOVARAGAN S', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '8438097795', 'poovaragansiva@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a46c1987-1f62-4502-b5a3-37275df01c28', '030d3ae5-5b28-4824-853c-17c254259827', 2, 'NISHANTH G A', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '9952133219', 'ganishanth27@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '005824fa-0553-4dbd-a8f0-c25c179a8d78', '030d3ae5-5b28-4824-853c-17c254259827', 3, 'SHAHIN S', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '9585604504', 'shahintechdata@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b1073854-6dd6-4c1f-91a0-3c1dca3d6e8d', '030d3ae5-5b28-4824-853c-17c254259827', 4, 'SHRIVAISHNAVI A', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '9043373404', 'shrivaishnavi1234@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '091170cd-67ac-4734-b831-166247291803', '6a34021e-43fb-420b-8ebd-fb312201e8c6', 1, 'Selva Kailash', 'Nehru Institute of Engineering and Technology', 'CSE', '2nd Year', '9360571671', 'selvakailash95@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '58c5edd9-7fb0-459c-b270-ca3733434733', '6a34021e-43fb-420b-8ebd-fb312201e8c6', 2, 'Sasinathan', 'Nehru Institute of Engineering and Technology', 'CSE', '2nd Year', '8870787524', 'sasinathantp@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '584ef861-e27e-4f1c-a0a6-d4143900263c', '6a34021e-43fb-420b-8ebd-fb312201e8c6', 3, 'Sribalaji', 'Nehru Institute of Engineering and Technology', 'CSE', '2nd Year', '6374447094', 'Sribalajigunasekaran@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f4cd6fcd-83b5-403e-a31a-5889b2ec17fa', '6a34021e-43fb-420b-8ebd-fb312201e8c6', 4, 'Madhunila', 'Nehru Institute of Engineering and Technology', 'CSE', '2nd Year', '8300471594', 'madhunila2007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c6bf9e4d-1be8-4139-a889-fdb2506757f8', '556509e2-2215-4dfc-936c-a57ce3455c39', 1, 'NITHEESH S', 'NANDHA ENGINEERING COLLEGE', 'CSE', '3rd Year', '9597209882', 'nitheeshnitheeshsanthi@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8810dce6-4e58-418c-b337-6483662d642a', '556509e2-2215-4dfc-936c-a57ce3455c39', 2, 'NANDHAGOPAL T', 'NANDHA ENGINEERING COLLEGE', 'CSE', '3rd Year', '8940733886', 'gopalnantha604@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e1116e4b-8dd7-4e26-bd85-57c44f65fdf1', '556509e2-2215-4dfc-936c-a57ce3455c39', 3, 'MOULEESHWARAN S', 'NANDHA ENGINEERING COLLEGE', 'CSE', '3rd Year', '9597510738', 'moulees200621@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a74911eb-86ad-4cac-b645-cbd7faa62fe7', '556509e2-2215-4dfc-936c-a57ce3455c39', 4, 'POOJASRI S', 'NANDHA ENGINEERING COLLEGE', 'CSE', '3rd Year', '9361632197', 'poojasrispoojasri5@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '811d0e9f-1099-44ec-9dfb-c32584e53ab7', '89def07c-1223-488c-95a6-dffa6e6e8ff6', 1, 'JAYAKUMAR M', 'SHREE VENKATESHWARA HI-TECH ENGINNERING  COLLEGE', 'B.E CSE CYBER SECURITY', '3rd Year', '9025110991', 'jayakumar.cyber@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b6c7b39f-e80d-4bc2-9b41-a0a28b7c7770', '89def07c-1223-488c-95a6-dffa6e6e8ff6', 2, 'SRIDHAR R', 'SHREE VENKATESHWARA HI TECH ENGINNERING COLLEGE', 'B.E CSE CYBER SECURITY', '3rd Year', '9342690139', 'rsridharrsridhar856@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '99c84a37-5659-4dae-aa86-1457fd0eda03', '89def07c-1223-488c-95a6-dffa6e6e8ff6', 3, 'NITHISH KUMAR G', 'SHREE VENKATESHWARA HI TECH ENGINNERING COLLEGE', 'B.E CSE CYBER SECURITY', '3rd Year', '8807217784', 'nithishkumar2005dec@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '93f6eb79-1191-4d74-87b0-97b9954aeb22', '89def07c-1223-488c-95a6-dffa6e6e8ff6', 4, 'MAITHREAYAN M', 'SHREE VENKATESHWARA HI TECH ENGINNERING COLLEGE', 'B.E CSE CYBER SECURITY', '3rd Year', '9344278895', 'threyanm@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a2a715d3-1781-415c-9b1e-b14457918da5', '1657ca50-1aa6-462c-b385-302eba69df0c', 1, 'GNANESHWER R', 'PAAVAI ENGINEERING COLLEGE', 'INFORMATION TECHNOLOGY', '3rd Year', '9025948661', 'selvaraju14feb@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f7da55b8-aa2c-4f42-b30f-f86728fde35c', '1657ca50-1aa6-462c-b385-302eba69df0c', 2, 'JANANI A', 'PAAVAI ENGINEERING COLLEGE', 'INFORMATION TECHNOLOGY', '3rd Year', '9790088748', 'jananiii2972007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'eba1d95b-6c71-4f25-afd1-7a59d20bbe79', '1657ca50-1aa6-462c-b385-302eba69df0c', 3, 'SHUBASHREE TN', 'PAAVAI ENGINEERING COLLEGE', 'INFORMATION TECHNOLOGY', '3rd Year', '6380211470', 'shubashree411@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '962a5b82-3758-4b3c-9a4f-d478acf32c54', '1657ca50-1aa6-462c-b385-302eba69df0c', 4, 'KALKISHREE R', 'PAAVAI ENGINEERING COLLEGE', 'INFORMATION TECHNOLOGY', '3rd Year', '7200498659', 'kalkirg007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e0a4de65-ab98-4fde-a4b4-d21c6d1d8bc9', 'cdc961de-929f-4e06-801b-47c9c03fffef', 1, 'Deepak kumar.D', 'VIT VELLORE', 'Integrated Mtech Software Engineering', '4th Year', '7871538005', 'deepakkumar.d2023@vitstudent.ac.in', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '62a5cfea-e52a-4df2-98b1-a2698e8ade51', 'cdc961de-929f-4e06-801b-47c9c03fffef', 2, 'Sabarishwaran J', 'VIT - VELLORE', 'Integrated Mtech software Engineering', '4th Year', '9080462629', 'sabarishwaran.2023@vitstudent.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '76034405-e03a-4ed9-830b-919388aeac9a', 'cdc961de-929f-4e06-801b-47c9c03fffef', 3, 'Kowshik M', 'VIT - VELLORE', 'Integrated Mtech software Engineering', '4th Year', '9842397070', 'kowshik.m2023@vitstudent.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '202bb83a-5424-42c0-8660-ccd3f61346d5', 'cdc961de-929f-4e06-801b-47c9c03fffef', 4, 'Sanjay S', 'Vellore Institute of Technology', 'Mtech Integrated Software Engineering', '4th Year', '6382041873', 'sanjay.s2023ba@vitstudent.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '15e751f0-bf3b-4595-8ac0-bc74512e7981', '56e0acad-0271-4c3f-a27a-751e21c264cf', 1, 'Kirthik raj', 'Sudharsan engineering college', 'AI&DD', '3rd Year', '7604978642', 'rajkirthik6@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c7c7353d-e1f2-4c02-9bcf-e3922b6f0631', '56e0acad-0271-4c3f-a27a-751e21c264cf', 2, 'Kavya Sri', 'Sudharsan engineering college', 'AI&DS', '3rd Year', '6381169031', 'aigottabeforall@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'bdda645c-3edc-4f75-90ee-f3a3b9310243', '56e0acad-0271-4c3f-a27a-751e21c264cf', 3, 'Thasbiha Banu', 'Sudharsan engineering college', 'AI&DS', '3rd Year', '8754996122', 'rajkirthik5@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd7237ba3-ef94-41da-91d2-18fca0abe219', '56e0acad-0271-4c3f-a27a-751e21c264cf', 4, 'Manikandan', 'Sudharsan engineering college', 'AI&DS', '3rd Year', '8825917738', '814424243028@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c8710f89-39c9-4ee7-a89e-00282d58213b', '8b02c33b-3665-47ac-b8a8-00dc2e9797fc', 1, 'Rizvan R', 'Velalar College of Engineering and Technology', 'Computer Science and Engineering', '2nd Year', '9865252594', 'rizvan2918@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ac3ad271-5194-458f-9e71-fa2c53d090d0', '8b02c33b-3665-47ac-b8a8-00dc2e9797fc', 2, 'Sadhana S', 'Velalar College of Engineering and Technology', 'Computer Science and Engineering', '2nd Year', '9345825611', 'sadhanasekar0@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c992e338-ef1a-4c7b-a0ca-fbcac7c1f8ac', '8b02c33b-3665-47ac-b8a8-00dc2e9797fc', 3, 'Shanmitha K', 'Velalar College of Engineering and Technology', 'Computer Science and Engineering', '2nd Year', '9486683623', 'shanmithakrishnan82007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e5f2f988-7e46-4d33-9b19-a09416b3657e', 'df0f67da-45cd-44e0-a977-b85aaeaf46c3', 1, 'Mathishree.D', 'Vivekanandha College of Engineering For Women', 'Computer Science and Engineering', '2nd Year', '9363799079', 'mathisrimsd008@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a4489db7-b0e1-4979-86fa-86ab4a41ccb7', 'df0f67da-45cd-44e0-a977-b85aaeaf46c3', 2, 'Harini priya.D', 'Vivekanandha College of Engineering For Women', 'Computer Science and Engineering', '2nd Year', '8870695905', 'harinipriya7279@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cdcba05a-a348-4076-a901-8d232c84766d', '087bd1f9-61a2-4497-812b-b82f35beb4fc', 1, 'Hari Balaji S', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9361985391', 'srinivasanhari072@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b3a0d931-5674-4991-8eb4-5a6de7f50368', '087bd1f9-61a2-4497-812b-b82f35beb4fc', 2, 'Sanjay Kumar V', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '7094051958', 'kumarsanjay91873@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '48f8295e-c43a-4d22-a0fe-ae944ecadc7d', '087bd1f9-61a2-4497-812b-b82f35beb4fc', 3, 'Naren karthick S', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9791375136', 'narenkarthick2510@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6e41d074-dc0d-4cab-99d7-8985d45b15a6', '087bd1f9-61a2-4497-812b-b82f35beb4fc', 4, 'Gokulakannan P', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '7358889119', 'gokulakannan.cyber@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '270fc887-1ce7-43d8-9354-9714d1fe95cf', 'c4b9161e-44af-4c9b-ad29-632a21488011', 1, 'J.JOHANNIE RINAH', 'GRACE COLLEGE OF ENGINEERING', 'B.Tech AI-DS', '2nd Year', '8300904611', 'johannierinah3@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '382ec6c9-608e-482f-bcf0-cf47fb65f3c0', 'c4b9161e-44af-4c9b-ad29-632a21488011', 2, 'R.NICE REENA', 'GRACE COLLEGE OF ENGINEERING', 'B.Tech AI-DS', '2nd Year', '8300904611', 'nicereena6@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ce4554d6-bda1-4a66-89f9-d92a9946dedd', '64a064cc-d949-478d-b123-5ef95d26c34e', 1, 'S.NOBHIN ARTHURS', 'KARUNYA INSTITUTION OF TECHNOLOGY AND SCIENCES', 'B.Tech AI-DS', '2nd Year', '9095054661', 'nobhinarthurs@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '701159de-56f3-4774-8554-939e58ba2205', '64a064cc-d949-478d-b123-5ef95d26c34e', 2, 'ANTONY FELIX', 'KARUNYA INSTITUTION OF TECHNOLOGY AND SCIENCES', 'B.Tech AI-DS', '2nd Year', '9095054661', 'nobhinarthurs@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8300d7ad-cf67-4ad8-974c-4511e9dfed2e', '4826c9ab-ca08-497f-adaf-0f71f5bcd912', 1, 'V.Abivarnisha', 'Paavai Engineering College', 'AI&DS', '3rd Year', '6380190048', 'vimalasada1940@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cfd98b40-6c13-40d5-b1df-c9fd2b72aa28', '4826c9ab-ca08-497f-adaf-0f71f5bcd912', 2, 'Kanishka R', 'Paavai Engineering College', 'AI&DS', '3rd Year', '8825612354', 'its.getkanishka12@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1d261a41-620a-4b9d-9597-8b586033a11a', '4826c9ab-ca08-497f-adaf-0f71f5bcd912', 3, 'Abinaya S', 'Paavai Engineering College', 'AI&DS', '3rd Year', '8778279515', 'siramabi198@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '61a9a540-d4fd-4688-a9d3-3e01da3ad86d', '4826c9ab-ca08-497f-adaf-0f71f5bcd912', 4, 'Kavya C', 'Paavai Engineering College', 'AI&DS', '3rd Year', '6381812558', 'kavyachandru292@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '77d2a04b-9aae-4c22-83b5-21931e3a7a5b', 'f85b29bd-a033-40fc-b50d-978b5134a1d4', 1, 'Santhosh.V', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '9042320295', 'santhoshvvnr@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4a329378-b06d-4828-a1d0-11fa04837b92', 'f85b29bd-a033-40fc-b50d-978b5134a1d4', 2, 'Sanjay.P.P', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '9042454001', 'sanjayperiyasamy064@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '27529945-c95e-49ac-a937-18731ba494ae', 'f85b29bd-a033-40fc-b50d-978b5134a1d4', 3, 'sisanth.B', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '9840772072', 'sisanthkrishna@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f5268f9a-72fe-44c3-981d-f43d13eb86cd', 'f85b29bd-a033-40fc-b50d-978b5134a1d4', 4, 'Vishal Murugan.M', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '8072411340', 'vishallalitha50@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7cbd5389-85c9-4cdb-b890-81cff1dc7b3b', 'd0b225dd-5b92-4dca-b854-4d747291ce27', 1, 'SRI RAMJI B', 'Knowledge Institute of Technology', 'B.E. Computer Science and Engineering', '2nd Year', '8807664984', '2k25cse210@kiot.ac.in', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '5ed381a6-3719-4b70-9cc3-4977ce584eb8', 'd0b225dd-5b92-4dca-b854-4d747291ce27', 2, 'SREE SANJEEV R', 'Knowledge Institute of Technology', 'B.E. Computer Science and Engineering', '2nd Year', '6379970146', '2k25cse209@kiot.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '48d6e3e4-3b7c-44df-877a-4d97614268b8', 'd0b225dd-5b92-4dca-b854-4d747291ce27', 3, 'SANJAY KUMAR M', 'Knowledge Institute of Technology', 'B.E. Computer Science and Engineering', '2nd Year', '9361988699', '2k25cse191@kiot.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '03581066-8c56-4691-a3af-d883f897dbdf', 'd0b225dd-5b92-4dca-b854-4d747291ce27', 4, 'SRIDHARAN M', 'Knowledge Institute of Technology', 'B.E. Computer Science and Engineering', '2nd Year', '8531887983', '2k25cse212@kiot.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7fc6c5b1-d2cd-4b5c-9b38-90170c50d673', '606b654c-f96f-4155-a5f5-2fb0c601ac7a', 1, 'Subhashree S', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '8438563511', 'subhashreesenthilkumarpn@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '170001a4-3533-4662-9c73-a59e0be1c687', '606b654c-f96f-4155-a5f5-2fb0c601ac7a', 2, 'Stephy A', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '9150652328', 'stephys988@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7f2c78a4-e9b4-4214-8b4c-938aa5079fa7', '606b654c-f96f-4155-a5f5-2fb0c601ac7a', 3, 'Yogesh R P', 'Knowledge institute of technology', 'Computer science and engineering', '2nd Year', '7358264798', 'rpyogesh55@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4b9d632f-5f36-4b8e-8f5e-80127c7c9a80', '606b654c-f96f-4155-a5f5-2fb0c601ac7a', 4, 'Nithin Varghese Thomas', 'Excel college of engineering and technology', 'Artificial intelligence and data science', '3rd Year', '8825784074', 'nithinvarghesethomas@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ae809e2f-0ec2-44f5-be4c-77ccbb152ed4', 'ab53412d-0963-4543-a1a1-79fdc5f20b54', 1, 'RITHIKA', 'SNS COLLEGE OF TECHNOLOGY', 'It', '2nd Year', '6369078416', 'rithikavk01@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '37992856-e3cb-484f-9691-35777330c07f', 'ab53412d-0963-4543-a1a1-79fdc5f20b54', 2, 'Nirmal c', 'SNS COLLEGE OF TECHNOLOGY', 'It', '2nd Year', '8122095958', 'nirmlachinnusamy@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'af55ee2d-e7d7-4ce7-9aa3-2f27ce756186', 'ab53412d-0963-4543-a1a1-79fdc5f20b54', 3, 'Vichuram T', 'SNS COLLEGE OF TECHNOLOGY', 'It', '2nd Year', '8122647405', 'vichuram17@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8e98232f-edc8-400d-bb7b-fc8a058ec0d4', 'ab53412d-0963-4543-a1a1-79fdc5f20b54', 4, 'Preethi', 'SNS COLLEGE OF TECHNOLOGY', 'It', '2nd Year', '9600328340', 'preethiravi2458@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4e608287-8793-4f45-b622-a3cb2c8e412f', '62ddbd5d-147b-4e04-9ef1-b2a174a079c4', 1, 'MAHESHWARI S', 'Shree Venkateshwara hi tech engineering college', 'Computer science and engineering', '3rd Year', '9942125851', 'maheshwaricse03@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'fab48d6c-754f-4aff-b30f-ffc99fb7b6d7', '62ddbd5d-147b-4e04-9ef1-b2a174a079c4', 2, 'HARITHA.S', 'Shree Venkateshwara hi tech engineering college', 'Computer science and engineering', '3rd Year', '8903421704', 'harithaharitha7199@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '687d0af2-23a3-4f4e-bded-dac4d34dde6a', '62ddbd5d-147b-4e04-9ef1-b2a174a079c4', 3, 'LAKSHANA.S', 'Shree Venkateshwara hi tech engineering college', 'Computer science and engineering', '3rd Year', '9894848214', 'lakshanasaravanan15@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '550975ee-31e8-474a-b2be-72a5d941d846', '62ddbd5d-147b-4e04-9ef1-b2a174a079c4', 4, 'LALITHAMBIGAI.S', 'Shree Venkateshwara hi tech engineering college', 'Computer science and engineering', '3rd Year', '6381542174', 'lalithampigais@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '36c51f2d-1c5c-4ba7-99d3-723eef1aca3d', 'ddca8e41-5aba-4f96-b4c9-6e37733f2cd1', 1, 'PRASANNA KUMAR SR', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9150204546', 'prasannakumarlh344@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0c1f26a3-9057-4a17-8173-c4638a7405ed', 'ddca8e41-5aba-4f96-b4c9-6e37733f2cd1', 2, 'GODWIN KUMAR K', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9994369329', 'esec1712007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6226853c-3878-4390-9508-9cfa94de9685', 'ddca8e41-5aba-4f96-b4c9-6e37733f2cd1', 3, 'BOOPTHI V', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9655042920', 'boopathivijayakumar007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c8a2869e-2f42-409a-8672-c9f923852e01', 'ddca8e41-5aba-4f96-b4c9-6e37733f2cd1', 4, 'SARAVANAN P', 'Erode Sengunthar Engineering College', 'CSE(CYBER SECURITY)', '3rd Year', '9360203018', 'saravananpattani14@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'fadd553c-718c-45cb-a405-6254d0966b60', '860710a5-f139-4e44-aac0-5094c6d5b07f', 1, 'Madhuvanthi S', 'Erode sengunthar engineering college', 'Computer Science and Engineering', '3rd Year', '8870244140', 'madhuvanthi229@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c229f1dd-9a4e-4b37-a37d-e4aab5f778cc', '860710a5-f139-4e44-aac0-5094c6d5b07f', 2, 'Mathangi S', 'Erode sengunthar engineering college', 'Computer Science and Design', '3rd Year', '8220324140', 'mathangi1367@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4452cfdb-ad64-424e-9131-fd2fba432929', '860710a5-f139-4e44-aac0-5094c6d5b07f', 3, 'Kavidharshini D', 'Erode sengunthar engineering college', 'Computer Science and Engineering', '3rd Year', '9080776376', 'kavidharshini1417@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'abd5014f-b8b0-4efd-85a6-a4b13084fbaa', '860710a5-f139-4e44-aac0-5094c6d5b07f', 4, 'Prajanna A', 'Erode sengunthar engineering college', 'Computer Science and Engineering', '3rd Year', '7708517715', 'prajannaarumugam@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '60ecec84-c50d-4ae9-b3b7-4217fba7167c', '666538d6-5cfb-4848-aa74-bd5e6cde05a7', 1, 'S kanishka', 'Dr. Mahalingam college of engineering and technology', 'Information technology', '3rd Year', '9894368150', 'skanishka2024@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c4c3ac9c-9f67-4518-bf3d-27c12185807a', '666538d6-5cfb-4848-aa74-bd5e6cde05a7', 2, 'Keerthana s', 'Dr. Mahalingam college of engineering and technology', 'Information technology', '3rd Year', '7603830878', 'keerthanasakthivel1602@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'adb3c647-7c5f-4947-9029-4acb4cd22e63', '666538d6-5cfb-4848-aa74-bd5e6cde05a7', 3, 'Malathi A', 'Dr. Mahalingam college of engineering and technology', 'Information technology', '3rd Year', '6385680151', 'maluanto87@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '5450e07c-3668-476d-9a91-542fc1f32566', 'bd0f49b3-de58-44b6-ae44-778f9817cf3b', 1, 'Rathimeena V', 'Dr.Mahalingam College of Engineering and Technology', 'Information Technology', '3rd Year', '9025642562', 'rathimeena6677@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '08e3bde7-d39c-4082-9724-73df2ecc911f', 'bd0f49b3-de58-44b6-ae44-778f9817cf3b', 2, 'Anbarasi M', 'Dr . Mahalingam College of Engineering and Technology', 'Information Technolgy', '3rd Year', '9952792930', 'anbarasimurali267@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '5b9b7513-131b-4be7-9d38-dbe585c6b18d', 'bd0f49b3-de58-44b6-ae44-778f9817cf3b', 3, 'Logesh P', 'Dr . Mahalingam College of Engineering and Technology', 'Automobile Engineering', '3rd Year', '6374512743', 'logeshpalanisamy245@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4f84d6e2-331f-4dc3-b4e0-889e4cc27a88', 'bd0f49b3-de58-44b6-ae44-778f9817cf3b', 4, 'Mahadharani D', 'Dr . Mahalingam College of Engineering and Technology', 'Information Technology', '3rd Year', '6385119477', 'mahadharani.d@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'bdddb926-3d6b-453c-9d76-cb8e961de117', 'd027f2d3-86c8-499d-ba93-f9014c531261', 1, 'ABISHEK P', 'KPR INSTITUTE OF ENGINEERING & TECHNOLOGY', 'B. TECH ARTIFICIAL INTELLIGENCE AND DATA SCIENCE', '3rd Year', '8489302266', '25adl01@kpriet.ac.in', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a670029f-3da5-4f1f-becf-d764a30e0bd2', 'd027f2d3-86c8-499d-ba93-f9014c531261', 2, 'SRI HARI R', 'KPR INSTITUTE OF ENGINEERING & TECHNOLOGY', 'B. TECH ARTIFICIAL INTELLIGENCE AND DATA SCIENCE', '3rd Year', '6381884877', 'sriharir122006@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e925caf1-a6ee-40af-a6c2-6e03dc2d6515', 'd027f2d3-86c8-499d-ba93-f9014c531261', 3, 'MIDHUNA V', 'KPR INSTITUTE OF ENGINEERING AND TECHNOLOGY', 'B.E COMPUTER SCIENCE AND ENGINEERING', '1st Year', '9042390599', '25099midhunaamhss@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ef4e0d27-ee13-45b8-b680-a95b30877881', '84d9f327-e32c-49cc-bdbb-08f238ade97b', 1, 'Lanitha shree K', 'Erode Sengunthar Engineering college', 'Computer science and engineering', '3rd Year', '9095019731', 'lanithakaruppusamy@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0f511ec5-7bd5-4cda-b837-16b0a911c2e5', '84d9f327-e32c-49cc-bdbb-08f238ade97b', 2, 'Kanishka M', 'Erode Sengunthar engineering college', 'Computer science and engineering', '3rd Year', '6383886458', 'kanishka2006007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '193f2952-746a-45f9-9d15-0a7a9a749a71', '84d9f327-e32c-49cc-bdbb-08f238ade97b', 3, 'Jivitha P', 'Erode Sengunthar engineering college', 'Computer science and engineering', '3rd Year', '9363921724', 'jivitha061@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f5da2328-5a0a-42eb-b7f8-b155168ea50a', '84d9f327-e32c-49cc-bdbb-08f238ade97b', 4, 'Kaviya sri R', 'Erode Sengunthar engineering college', 'Computer science and engineering', '3rd Year', '9342368374', 'kaviyakaviya87897@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6b04c3d8-853b-43f1-af79-3ca4b3ce1acc', 'fb3cd4f8-122d-449f-a4b2-9add96799566', 1, 'SRIJANE JN', 'KPR INSTITUTE OF ENGINEERING & TECHNOLOGY', 'B. TECH AIDS', '3rd Year', '9047056070', 'srijanejn06@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '54b3b4a6-7f38-403a-9958-3ce8640c4191', 'fb3cd4f8-122d-449f-a4b2-9add96799566', 2, 'RITHIKA C', 'KPR INSTITUTE OF ENGINEERING & TECHNOLOGY', 'B. TECH AIDS', '3rd Year', '7708682468', '24ad092@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a07309e9-6b0f-4f7d-ad09-fbbb542aa239', 'fb3cd4f8-122d-449f-a4b2-9add96799566', 3, 'Dhakshesh Praveenkumar', 'KPR INSTITUTE OF ENGINEERING & TECHNOLOGY', 'B.E COMPUTER SCIENCE AND ENGINEERING', '1st Year', '9842088841', '26cs074@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '620ceb98-fbba-4045-b32b-5ae72c450bf8', 'be14d739-ec1d-4dde-85c1-0dbdb14f2fe3', 1, 'Raksha P V', 'SIMATS Engineering (Saveetha School Of Engineering)', 'Biomedical Engineering', '4th Year', '7806957556', 'rakshapv9016.sse@saveetha.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '801ef0ae-eaa4-4d80-b2b5-5121a495a256', 'be14d739-ec1d-4dde-85c1-0dbdb14f2fe3', 2, 'Divakar K', 'SIMATS Engineering(Saveetha School Of Engineering)', 'Biomedical Engineering', '4th Year', '7397131232', 'divakark9008.sse@saveetha.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0933db20-ae36-4219-87cc-dbb7384724f2', 'be14d739-ec1d-4dde-85c1-0dbdb14f2fe3', 3, 'Rahul Priyan P', 'SIMATS Engineering(Saveetha School Of Engineering)', 'Biomedical Engineering', '4th Year', '8825909204', 'rahulpriyanp9010.sse@saveetha.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '01a7661d-dda0-4052-afaf-524f278b777a', '9b62cff2-455c-4dae-97de-4886e1109a97', 1, 'Harini.R', 'Saveetha School of Engineering', 'Biomedical Engineering', '4th Year', '6380534848', 'harurav456@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c9589cf3-54fb-4684-8016-5669617bb391', '9b62cff2-455c-4dae-97de-4886e1109a97', 2, 'Monika A', 'Saveetha School of Engineering', 'Biomedical Engineering', '4th Year', '9514726148', 'monika.arumugam10@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a9bd4c2a-527f-4ac4-a493-ea28010188bf', '9b62cff2-455c-4dae-97de-4886e1109a97', 3, 'G.Sweatha', 'Saveetha School of Engineering', 'Biomedical Engineering', '4th Year', '8122065268', 'sweathaaprabakar@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd057b309-5783-4b00-8258-1b2cb1eddc50', '927877ed-beb7-4325-8366-8c6cadd47cea', 1, 'DEEPAKUMAR.S', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '7358820428', 'skdeepakumar000@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '54c3a6e2-2d98-478a-aeca-0b04c6ba129e', '927877ed-beb7-4325-8366-8c6cadd47cea', 2, 'INBAVEL V', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '6374469474', 'inba2526@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '21ccf971-acbd-4bdf-a9d8-ddfa475a0344', '927877ed-beb7-4325-8366-8c6cadd47cea', 3, 'Gokul K', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '9489957709', 'gokulstudent1234@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '12ca1a09-6584-4092-a56c-ae921ee60f23', '927877ed-beb7-4325-8366-8c6cadd47cea', 4, 'GANESHWARAN K', 'Nehru Institute of Engineering and Technology', 'B.E CSE', '2nd Year', '8124670334', 'ganeshkannan2234@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '18f0ca34-ef41-4cf5-8d8e-a990fb905022', 'e17a9703-fdd5-4cd0-9590-13f07aec7592', 1, 'vishal T', 'Nehru Institute of Engineering and Technology', 'Computer Science Engineering', '2nd Year', '9791679489', 'vishal2006t@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd7939fd4-3120-42b8-af24-fd1edc8d5472', 'e17a9703-fdd5-4cd0-9590-13f07aec7592', 2, 'SUNDRA SEKAR K', 'Nehru Institute of Engineering and Technology', 'Computer Science and Engineering', '2nd Year', '7092743870', 'sundrasekar2812@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '846ca4d4-a8f6-4e67-bb70-c34ddcc3ad99', 'e17a9703-fdd5-4cd0-9590-13f07aec7592', 3, 'HariKrishna M', 'Nehru Institute of Engineering and Technology', 'Computer Science and Engineering', '2nd Year', '6384982465', 'harikrishna04546@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7d242c80-dcb8-4f3a-bd2d-e8eb96b4558e', 'e17a9703-fdd5-4cd0-9590-13f07aec7592', 4, 'MATHAVAN M', 'Nehru Institute of Engineering and Technology', 'Computer Science and Engineering', '2nd Year', '8675405713', 'mathavanm638583@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '66c770fc-a77b-44cd-aba9-73356886535c', 'f16cd3a0-00bd-458d-940d-9183cab81c45', 1, 'GANGOTRI K', 'SHREE VENKATESWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '9080406255', 'gangojay3@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ff1ac3a6-e2c1-4df7-bd6f-4ebab9da732e', 'f16cd3a0-00bd-458d-940d-9183cab81c45', 2, 'MOHANASUNDARAM S', 'SHREE VENKATESWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '8754084507', 'msmohan4507@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '2b82808c-bc03-4c63-bcf2-0f8e5698ebbe', 'f16cd3a0-00bd-458d-940d-9183cab81c45', 3, 'VR Vishal', 'SHREE VENKATESWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '7904151455', 'vrvishal448@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '9b48c301-a062-47e8-bf55-fe28b10c9eff', 'f16cd3a0-00bd-458d-940d-9183cab81c45', 4, 'AGASTIN J', 'SHREE VENKATESWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '9941872735', 'agastinagastin183@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '23b900d6-0c6e-4d6c-8c8a-a426a3501d47', '12d4e778-727e-4918-8a5a-6c4c10c44d64', 1, 'PRADEEPA S', 'Muthayammal engineering college rasipuram', 'CSE', '3rd Year', '8695531647', 'Pradeepashanmugam1214@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '727c2973-30fb-4c00-ac8c-c30a33bf72c8', '12d4e778-727e-4918-8a5a-6c4c10c44d64', 2, 'GOKULNATH S', 'Muthayammal engineering college rasipuram', 'CSE', '3rd Year', '9344256865', 'gokulnath1217@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a893cace-fd41-4bdd-ae8d-1c5fcddeb059', '12d4e778-727e-4918-8a5a-6c4c10c44d64', 3, 'MAHA S', 'Muthayammal engineering college rasipuram', 'CSE', '3rd Year', '9360040323', 'mahamssrinivasan2006@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '239dae43-9eab-4582-9de2-d69a75121bb2', '12d4e778-727e-4918-8a5a-6c4c10c44d64', 4, 'NITHYADHARSINI B', 'Muthayammal engineering college rasipuram', 'CSE', '3rd Year', '9385466198', 'Nithyadharsinib@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cf2ec175-ed36-402c-9c58-76e7e85c0da7', 'ae3ac5b1-6e7f-48a9-88e0-04a7535108fe', 1, 'Subiksha C', 'Karpagam College of Engineering', 'CSE', '2nd Year', '8122625618', 'subichan18@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '325d8f00-e5e0-4492-8392-ad07b891a377', 'ae3ac5b1-6e7f-48a9-88e0-04a7535108fe', 2, 'Sneha R', 'Karpagam College of Engineering', 'CSE', '2nd Year', '7395864974', 'snehasneha7202@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6b558876-8910-4e56-9b2c-2e8c92d5aa74', 'ae3ac5b1-6e7f-48a9-88e0-04a7535108fe', 3, 'Lakshana P', 'Karpagam College of Engineering', 'CSE', '2nd Year', '8610683906', 'baranipalanivel73@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '00ca9566-6413-4429-9d23-a39e51560b05', 'ae3ac5b1-6e7f-48a9-88e0-04a7535108fe', 4, 'Nisha R', 'Karpagam College of Engineering', 'CSE', '2nd Year', '9043439255', 'rnisha1662008@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1d30c1af-9111-4bfa-b4b9-7d0378d5b61b', 'c0020bec-35fc-44dc-83b0-fe045c7164b6', 1, 'DEVADHARSHINI K', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'COMPUTER SCIENCE AND ENGINEERING', '3rd Year', '9942507343', 'kdevadharshini1405@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'af4fdfa3-0013-4e07-bc82-3f3eaccee490', 'c0020bec-35fc-44dc-83b0-fe045c7164b6', 2, 'DHARSHINI J', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'COMPUTER SCIENCE AND ENGINEERING', '3rd Year', '7904757789', 'dharshinij850@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '693f60ed-af0d-4eb4-a1c5-73f9b8085eed', 'c0020bec-35fc-44dc-83b0-fe045c7164b6', 3, 'GOMATHI S', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'COMPUTER SCIENCE AND ENGINEERING', '3rd Year', '9865661771', 'ssaravanan15551@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '34a10086-eede-426d-a457-db8ec16aab3c', '71d011c1-4c07-4456-9221-5c39078cbdfb', 1, 'DHANUSHKUMAR G', 'Hindusthan college of Arts and Science', 'Information Technology', '2nd Year', '9345590559', 'dhanushkumaramk@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '2b8b6896-01a1-41d6-a267-268f51acafc3', '71d011c1-4c07-4456-9221-5c39078cbdfb', 2, 'Madhesh S', 'Hindusthan college of Arts and Science', 'Information Technology', '3rd Year', '8754398461', '24bit062@hicas.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd33658fb-abaf-49a7-a668-d958727b0683', '71d011c1-4c07-4456-9221-5c39078cbdfb', 3, 'Preethika S', 'Hindusthan college of Arts and Science', 'Information Technology', '3rd Year', '8807680257', 'preethasekar043@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '31f6e6af-8b29-400b-a22f-2cdbb31b17d7', '71d011c1-4c07-4456-9221-5c39078cbdfb', 4, 'Raja Sudharshan S', 'Hindusthan college of Arts and Science', 'Computer Technology', '3rd Year', '7418553172', '24bst043@hicas.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0f9747c0-e2a6-44e9-80c4-3aff0e51ef89', '05474ad4-9f39-43f5-86ae-291728e5d0ce', 1, 'Soshiha RV', 'Knowledge institute of technology', 'Computer Science and engineering', '2nd Year', '8754213899', '2k25cse208@kiot.ac.in', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6a429a80-e84e-419b-a03c-25ba291716ef', '05474ad4-9f39-43f5-86ae-291728e5d0ce', 2, 'Udhayathaarani J', 'Knowledge institute of technology', 'Computer Science and engineering', '2nd Year', '7905641397', '2k25cse227@kiot.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1a867449-ecc8-4e06-ba95-2810c3969f25', '05474ad4-9f39-43f5-86ae-291728e5d0ce', 3, 'Inbhan', 'Knowledge institute of technology', 'Computer Science and engineering', '2nd Year', '9344498364', 'inbhan0311@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd7556fd9-8c5e-4eb7-bbdd-adc760d1848a', '05474ad4-9f39-43f5-86ae-291728e5d0ce', 4, 'Santhosh', 'Knowledge institute of technology', 'Computer Science and engineering', '2nd Year', '9360008066', 'santhoshbalasubramaniam26@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4ff6f44f-5ba5-4941-be2d-e2481a26edf6', '8f423e82-f09b-40de-a9b0-61f15d499e83', 1, 'Anbuchelvan.N.K', 'RATHINAM TECHNICAL CAMPUS', 'B-TECH - INFORMATION TECHNOLOGY', '3rd Year', '9486794535', 'anbuchelvan2829@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '9a90b675-dcb1-47ab-9a72-ea70e5e10942', '8f423e82-f09b-40de-a9b0-61f15d499e83', 2, 'DESAPRIYA.M', 'RATHINAM TECHNICAL CAMPUS', 'B-TECH - INFORMATION TECHNOLOGY', '3rd Year', '7397347422', 'desapriya0203@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '98bf56a6-4b20-4c9c-a646-87d738d82e0e', '8f423e82-f09b-40de-a9b0-61f15d499e83', 3, 'JOEL.V.S', 'RATHINAM TECHNICAL CAMPUS', 'B-TECH - INFORMATION TECHNOLOGY', '3rd Year', '9994212016', 'vsj01657@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '2f46dba2-4975-4cd3-80c0-e5dd6398f389', '8f423e82-f09b-40de-a9b0-61f15d499e83', 4, 'JAIPAL.MR', 'RATHINAM TECHNICAL CAMPUS', 'B-TECH - INFORMATION TECHNOLOGY', '3rd Year', '8903286030', 'jaipal2972006@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8dbfcebf-8e76-4e5c-8c1e-f47ca655f06b', 'f98c528a-be86-4422-bb18-0e1f26de60fb', 1, 'Vinoba Rosi W', 'SSM Institute of Institute of Engineering & Technology,Dindigul', 'B.Tech-AI&DS', '2nd Year', '8148482640', 'vinobarosi@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a4d9cdbe-c929-41ec-afa2-244086eacd1d', 'f98c528a-be86-4422-bb18-0e1f26de60fb', 2, 'Sathyapriya S', 'SSM Institute of Engineering & Technology,Dindigul', 'B.Tech-AI&DS', '2nd Year', '9444958641', 'sathyapriya212006@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7d755d15-3492-40cf-9407-2c8167f08c86', 'f98c528a-be86-4422-bb18-0e1f26de60fb', 3, 'Sathiya Priya S', 'SSM Institute of Engineering & Technology,Dindigul', 'B.Tech-AI&DS', '2nd Year', '7904705652', 'sathiya292007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'bf5f13a4-f188-4bbb-a29c-80e2790057cb', 'f98c528a-be86-4422-bb18-0e1f26de60fb', 4, 'Nithra M', 'SSM Institute of Engineering & Technology,Dindigul', 'B.Tech-AI&DS', '2nd Year', '8807859664', 'nithra834@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7074b8bc-42ac-4a5d-9a04-9623cf952116', 'dc6bed68-c577-45f0-adeb-bd309082f003', 1, 'Dhanushkumar Sekar', 'Coimbatore Institute of Engineering and Technology', 'Computer Science Engineering', '3rd Year', '9894701466', 'kdhanush484@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3b9de051-a227-4571-bd14-d42daeebfc39', 'dc6bed68-c577-45f0-adeb-bd309082f003', 2, 'Rahul A', 'Coimbatore Institute of Engineering and Technology', 'Computer Science Engineering', '2nd Year', '6379400757', 'rahulciet18@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b562268b-9c82-4ccf-916c-4f390ea75531', 'dc6bed68-c577-45f0-adeb-bd309082f003', 3, 'Darshan R', 'Coimbatore Institute of Engineering and Technology', 'Computer Science Engineering', '2nd Year', '8637418886', 'darshanr13102007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3dd0976d-5815-4d24-afaf-33e1a179cc43', 'be7265f6-271c-44da-ad68-ccb79183798d', 1, 'Rohith kanna J R', 'Nandha Engineering College', 'Computer science and engineering', '3rd Year', '8438532377', '24csl24@nandhaengg.org', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cbfb98c7-a325-4546-91f3-4b50dcdf1ee9', 'be7265f6-271c-44da-ad68-ccb79183798d', 2, 'Naresh S', 'Nandha Engineering College', 'Computer science and engineering', '3rd Year', '8438532377', '24csl24@nandhaengg.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'bd56644f-6b1b-4e7a-b59d-303ac17901aa', 'be7265f6-271c-44da-ad68-ccb79183798d', 3, 'Mohmed Faheem S', 'Nandha Engineering college', 'Computer science and engineering', '3rd Year', '9500305737', '24csl21@nandhaengg.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '98c723b3-0d85-45f0-b35b-e3dff3d46f77', 'be7265f6-271c-44da-ad68-ccb79183798d', 4, 'Mohamed Niyaz A', 'Nandha engineering college', 'Computer science and engineering', '3rd Year', '9361201955', '24csl20@nandhaengg.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ee4106f0-3b50-473e-8ccd-493008d897a6', '0e490975-3079-4456-baa0-91f67f650992', 1, 'Gavutham G', 'Vellore Institute of Technology, Vellore', 'Integrated Mtech software Engineering', '4th Year', '6380575200', 'gavutham07@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3b216321-ecfe-4c2d-83a9-f34b743fff36', '0e490975-3079-4456-baa0-91f67f650992', 2, 'Sinduja K', 'Vellore Institute of Technology, Vellore', 'Integrated Mtech Software Engneering', '4th Year', '9629343343', 'sindu070106@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '9f768bc3-c5ea-43b2-b16a-33a544c9430a', '0e490975-3079-4456-baa0-91f67f650992', 3, 'MohanaKumar L', 'Vellore Institute of Technology, Vellore', 'Integrated Mtech Software Engneering', '4th Year', '8903070452', 'mohanakumar.mk06@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'dfa537b4-5077-4ecc-b6d1-4280e4d25c3c', '0e490975-3079-4456-baa0-91f67f650992', 4, 'Amrutha Shree S', 'Vellore Institute Technology, Vellore', 'Integrated Mtech Datascience', '4th Year', '7871667502', 'amruthashree1605@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '44774c1e-b9cd-4ce1-890f-b0bb9c2c1246', '5b27b595-893e-423f-9baf-259f302fb172', 1, 'Sanjay J', 'Vellore Institute of Technology', 'Integrated M.tech Software Engineering', '4th Year', '9626654991', 'sanjayjothilingam@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7e5d5e3f-2bae-4a8e-b2ad-8c536c6552b1', '5b27b595-893e-423f-9baf-259f302fb172', 2, 'Gugaan M', 'Vellore Institute of Technology', 'Integrated M.tech Software Engineering', '4th Year', '6382744928', 'gugaan676@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6301fd83-b31d-4789-bf2b-eab8ce4dfcd4', '5b27b595-893e-423f-9baf-259f302fb172', 3, 'T R Chandhana', 'Vellore Institute of Technology', 'Integrated M.tech Software Engineering', '4th Year', '9392282011', 'vedasree2102005@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1603ac2f-fba1-4e4e-92bb-9cdcc83df326', '5b27b595-893e-423f-9baf-259f302fb172', 4, 'Madhumitha N', 'Vellore Institute of Technology', 'Integrated M.tech Software Engineering', '4th Year', '8438257879', 'nmadhumitha30@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '439e3286-7bfd-414e-87ba-2e46c5bd2d9d', 'eef5771d-0efc-4531-9f2c-959d18dd0b13', 1, 'Sandhiya C', 'Velalar college of engineering and technology', 'BE-CSE', '2nd Year', '6383361685', 'imsand108@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd73c08c9-c356-4052-9884-48a874fd0062', 'eef5771d-0efc-4531-9f2c-959d18dd0b13', 2, 'Sujai S P', 'Velalar college of engineering and technology', 'BE-CSE', '2nd Year', '9597986416', 'sujai822008@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '37583bbd-0415-4b82-82ca-4f59736f8ec7', 'eef5771d-0efc-4531-9f2c-959d18dd0b13', 3, 'Vijaya Mohan S', 'Velalar college of engineering and technology', 'BE-CSE', '2nd Year', '7305284201', 'vijayamohan965@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '68cec0d1-7679-4a31-9119-59e3c7197ee2', 'eef5771d-0efc-4531-9f2c-959d18dd0b13', 4, 'Vaishali R', 'Velalar college of engineering and technology', 'BE-CSE', '2nd Year', '8610848223', 'vaishalirajkumarkpm@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c754a337-c62d-4ec7-b840-4368c224d0e0', '4a06f8f2-7067-4d51-b038-2e49f35a3383', 1, 'Jasima Firadouse', 'Dhaanish ahmed institute of technology', 'Cse', '4th Year', '9363207104', 'jasimafiradouse@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '53bc8c52-938e-4f03-adce-3a9ff382fa1e', '4a06f8f2-7067-4d51-b038-2e49f35a3383', 2, 'Nazreen Taj', 'Dhaanish ahmed institute of technology', 'Artificial intelligence and data science', '4th Year', '9894471994', 'nazreentaj03@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '82cbde7d-9e52-4404-b571-79c0d810c127', '4a06f8f2-7067-4d51-b038-2e49f35a3383', 3, 'Ahamed Nawaz', 'Dhaanish ahmed institute of technology', 'Cse', '4th Year', '8695680701', 'ahamednawaz44@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'af2c27b8-d489-4b76-92da-ea28aab7d6c4', '4a06f8f2-7067-4d51-b038-2e49f35a3383', 4, 'Faheem ahamed', 'Dhaanish ahmed institute of technology', 'Cse', '4th Year', '8148811610', 'farifaheem4@gamil.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '55eadbb4-67bf-45dc-adaa-853c5edac808', '2a601fcf-f367-4e61-ad08-d9ca49a9f2fd', 1, 'M Kaarthik', 'Vellore Institute Of Technology', 'Integrated MTech in Software Engineering', '4th Year', '9884278269', 'kaarthik.m2005@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'de855e59-5de5-4547-ba1f-d3592e068519', '2a601fcf-f367-4e61-ad08-d9ca49a9f2fd', 2, 'Pavan Kalyan K', 'Vellore Institute Of Technology', 'Integrated MTech in Software Engineering', '4th Year', '6380272702', 'pavankalyan7127@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'fb2f7da6-836c-4b28-bdbd-7f28a9dc8428', '2a601fcf-f367-4e61-ad08-d9ca49a9f2fd', 3, 'S R Sathi Vikash', 'Vellore Institute Of Technology', 'Integrated MTech in Software Engineering', '4th Year', '6379142847', 'sathivikash2005@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3b87c29e-254d-4a82-b6ca-751b7865c7c0', '629a5b45-2f7e-43e4-9390-0ed7c9c353a9', 1, 'CHINNADURAI C', 'K.S.R College of Engineering', 'B.Tech IT', '2nd Year', '8015508286', 'chinnadurai8015@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ae1ea58c-7ccd-46eb-b713-f90843385dbc', '629a5b45-2f7e-43e4-9390-0ed7c9c353a9', 2, 'HANISHA K', 'K.S.R College of Engineering', 'B.TECH IT', '2nd Year', '7413075155', 'hanishakumaravel@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'af7e5ab8-3ad3-44d7-9565-a49d3a5698c4', '629a5b45-2f7e-43e4-9390-0ed7c9c353a9', 3, 'DHIVYADHARSHINI G', 'K.S.R College of Engineering', 'B.Tech IT', '2nd Year', '7530027536', 'dhivyadharshini3212@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c0b8d4ae-1905-4a4a-8cf4-567184297a74', '629a5b45-2f7e-43e4-9390-0ed7c9c353a9', 4, 'BRINDHA S', 'K.S.R College of Engineering', 'B.Tech IT', '2nd Year', '6381577531', 'birushanmugam@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '10091706-6ccf-4143-b53f-224333b0c22e', '5472dbe4-189c-414c-badf-b3df5494dfbb', 1, 'Gokulnath A', 'Rathinam Technical Campus', 'B.Tech-IT', '3rd Year', '7603939041', 'msdgokul1407@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '214e37f8-ad2a-431d-8ff8-194e14683c54', '5472dbe4-189c-414c-badf-b3df5494dfbb', 2, 'Bavitha E', 'Rathinam Technical Campus', 'B.Tech-IT', '3rd Year', '6381519653', 'bavithakalai@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b5874b2b-be61-4fb4-818e-00228da7585c', '5472dbe4-189c-414c-badf-b3df5494dfbb', 3, 'Kaviya K', 'Rathinam Technical Campus', 'B.Tech-IT', '3rd Year', '9626537553', 'kaviyakanagaraj28@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd919d12b-9911-4f46-90e8-d41c6a9a62a8', '5472dbe4-189c-414c-badf-b3df5494dfbb', 4, 'Soniya', 'Rathinam Technical Campus', 'B.Tech-IT', '3rd Year', '7904427237', 'dsdravid2704@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '58f07228-c48d-4a61-baa7-79532a5bb869', '0ac1038f-b9bf-41af-85a8-55f6102720f0', 1, 'Bhuvanesh S', 'kpr institute of engineering', 'CSE', '2nd Year', '9344479803', 'bhuvanesh2604.s@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0ccdfe90-7c2d-418d-bb29-b011f528d259', '0ac1038f-b9bf-41af-85a8-55f6102720f0', 2, 'Afrith L', 'kpr engineering', 'CSE', '2nd Year', '7708524812', '25cs007@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'eee32113-b789-443c-b7b5-76a2e5d35a07', '0ac1038f-b9bf-41af-85a8-55f6102720f0', 3, 'Mounesh PS', 'kpr engineering', 'CSE', '2nd Year', '8870757161', '25cs152@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1164a66b-78d4-4e94-b8ce-5baccaef7de1', '0ac1038f-b9bf-41af-85a8-55f6102720f0', 4, 'Ajhaikrishna RK', 'kpr engineering', 'CSE', '2nd Year', '8300424509', '25cs010@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '30a626a6-8f21-4eba-be5e-601563a01918', 'c40f3574-d14f-429b-bbe4-707d02619f6b', 1, 'ABISEK P', 'Dhanalakshmi Srinivasan college of engineering, coimbatore', 'B.E.CSE', '2nd Year', '9943558866', 'abisekp25@dsce.ac.in', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a0b0024c-ee22-439d-875b-775802242d77', 'c40f3574-d14f-429b-bbe4-707d02619f6b', 2, 'ARUL CT', 'Dhanalakshmi Srinivasan college of engineering, coimbatore', 'B.E.CSE', '2nd Year', '9345408356', 'ctarul1400@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '733a49c8-de91-4c75-aeeb-3e6b7228b1c1', 'c40f3574-d14f-429b-bbe4-707d02619f6b', 3, 'ADITHYA S', 'Dhanalakshmi Srinivasan college of engineering, coimbatore', 'B.E.CSE', '2nd Year', '6380147022', 'adithyaseenu2008@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8d058e61-20b9-4355-93b0-c4359d427e9a', 'c40f3574-d14f-429b-bbe4-707d02619f6b', 4, 'ANAND A', 'Dhanlakshmi Srinivasan college of engineering, coimbatore', 'B.E.CSE', '2nd Year', '9385376269', 'a.thenmozhi.anand@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'aa166bf9-1dbd-4f55-bd36-00ce85e7baa9', '9f9fc2d3-2b99-47f1-8a47-0aa6761d59f1', 1, 'Manyanthra M S', 'Kumaraguru College of Technology', 'CSE', '3rd Year', '8883337722', 'manyanthra@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '75b17007-fb95-48f8-87ab-08b1ab5b4f01', '9f9fc2d3-2b99-47f1-8a47-0aa6761d59f1', 2, 'Sandhiya M', 'Kumaraguru College of Technology', 'IT', '3rd Year', '9600810219', 'msandhiya678@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1a81b68b-690f-4afc-8b81-49ddfc347835', '9f9fc2d3-2b99-47f1-8a47-0aa6761d59f1', 3, 'Pragathi S', 'Kumaraguru College of Technology', 'IT', '3rd Year', '6374236114', '1113pragathi@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '2d8bb690-65e1-4e09-9d27-706ab8580fa1', '9f9fc2d3-2b99-47f1-8a47-0aa6761d59f1', 4, 'Pranusree SA', 'Kumaraguru College of Technology', 'CSE', '3rd Year', '9894432499', 'sapranusree@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '4f8c5927-8237-4625-8ebc-4db2e6ae65be', 'fc9d43bb-c77e-41e5-8764-a577d0506e58', 1, 'Sabari K', 'Velalar college of engineering and technology', 'Computer science and engineering', '2nd Year', '6383881558', 'sabarikanagaraj.ndk@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'eb6a91b4-d2ab-42b4-8837-fde3fd10488e', 'fc9d43bb-c77e-41e5-8764-a577d0506e58', 2, 'Sanjana R', 'Velalar college of engineering and technology', 'Computer science and engineering', '2nd Year', '8056587316', 'sanjanaram1927@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '922dbd05-742b-4b55-bfc1-414505a3d23f', 'fc9d43bb-c77e-41e5-8764-a577d0506e58', 3, 'Vinetha', 'Velalar college of engineering and technology', 'Computer science and engineering', '2nd Year', '6380566532', 'vinethaspl@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '493561d1-821a-4bb6-abb6-43ed6b925e18', 'fc9d43bb-c77e-41e5-8764-a577d0506e58', 4, 'Rithish NJ', 'Velalar college of engineering and technology', 'Computer science and engineering', '2nd Year', '9786830758', 'njrithish26@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c3656bcd-dd9a-49ef-9809-7c2b35959808', 'c2d6966b-cb21-4247-a113-b309a171e2bb', 1, 'SANJAY M', 'SNS College of Technology', 'Computer Science and Engineering', '1st Year', '9894190270', 'sanjay689thechampion@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '71588d46-4947-4046-9dee-3363ece223cd', 'c2d6966b-cb21-4247-a113-b309a171e2bb', 2, 'SHIVA KARTHIK S', 'SNS College of Technology', 'Computer Science and Engineering', '1st Year', '7358955208', 'shivakarthik1iq@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c121377f-6a87-4d47-9e09-fb278abaa06a', 'c2d6966b-cb21-4247-a113-b309a171e2bb', 3, 'SAARATHI A', 'SNS College of Technology', 'Computer Science and Engineering', '1st Year', '7550030099', 'saarathimsaarathi@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3242905d-dd56-4b06-8cec-00b8ff52ac76', 'c2d6966b-cb21-4247-a113-b309a171e2bb', 4, 'SAMSON R', 'SNS College of Technology', 'Computer Science and Engineering', '1st Year', '9865306272', 'samson.162008@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '79ff1e20-9b00-47c7-89df-3dcece8cbc63', '1f444940-9073-4da3-b2ce-7df1b473d4f6', 1, 'SHREE LAKSHITHA S', 'KPR INSTITUTE OF ENGINEERING AND TECHNOLOGY', 'CSE', '2nd Year', '8056450637', 'lakshitha0506@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6f105c43-18b8-432a-ae79-4f266958fb5c', '1f444940-9073-4da3-b2ce-7df1b473d4f6', 2, 'SHIVANI J', 'KPR INSTITUTE OF ENGINEERING AND TECHNOLOGY', 'CSE', '2nd Year', '8148154807', '25cs242@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '32a91241-63b5-4653-b9d1-99696c1b1c7a', '1f444940-9073-4da3-b2ce-7df1b473d4f6', 3, 'PRIYADHARSHINI V', 'KPR INSTITUTE OF ENGINEERING AND TECHNOLOGY', 'CSE', '2nd Year', '7708468308', '25cs195@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '087b29d9-e4a2-480b-afd1-e502b57ddff8', 'adbe08aa-2b67-43b5-8b7a-06e0627c9bee', 1, 'Thirumurugan S', 'Sasurie college of engineering', 'Cybersecurity', '2nd Year', '6385337412', 'sthirumurugan161@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'fcde5514-2535-4403-a642-2e46699d8f41', 'adbe08aa-2b67-43b5-8b7a-06e0627c9bee', 2, 'Padmasri M', 'Sasurie college of engineering', 'Cybersecurity', '2nd Year', '6382944959', 'padmasrisc25@sasurie.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f6a2316d-3edf-4383-866d-5ae2c8d0fcb8', 'adbe08aa-2b67-43b5-8b7a-06e0627c9bee', 3, 'Madhavan K', 'Sasurie college of engineering', 'Cybersecurity', '2nd Year', '9486013638', 'madhavansc25@sasurie.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '61979b9f-32b8-4bf0-9f41-1d7de729f78d', 'adbe08aa-2b67-43b5-8b7a-06e0627c9bee', 4, 'Yogaghaanth M.K', 'Sasurie college of engineering', 'CSE', '2nd Year', '9677891252', 'yogaghaanthcse25@sasurie.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3bfa7fcc-171a-477c-a4ec-58114576ca07', 'fbf46630-119c-4d04-abb2-af889b0a8999', 1, 'Harunya K', 'NPR college of Engineering and Technology', 'BE CSE', '3rd Year', '8110015477', 'harunyak583224104038@nprcolleges.org', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '23e7e0c6-829d-470b-b16b-712cb22be294', 'fbf46630-119c-4d04-abb2-af889b0a8999', 2, 'Bhavana R', 'NPR college of Engineering and Technology', 'BE CSE', '3rd Year', '9790598486', 'bhavanar583224104015@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8f85de3b-a992-4a7a-8a43-ad100d7ba17b', 'fbf46630-119c-4d04-abb2-af889b0a8999', 3, 'Divya Dharshini M', 'NPR college of Engineering and Technology', 'BE CSE', '3rd Year', '9123525820', 'divyadharshinim583224104024@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7ea96262-c8c1-4875-aac9-d05067b95ba4', 'fbf46630-119c-4d04-abb2-af889b0a8999', 4, 'Gomathi Karthika K', 'NPR college of Engineering and Technology', 'BE CSE', '3rd Year', '7339170740', 'gomathikarthikak583224104027@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8ad98ad4-af85-4c59-93b3-39f327d4f4f1', '0e893d86-861d-4db1-8ace-866418eed506', 1, 'Adila haseen', 'NPR college of engineering', 'CSE', '3rd Year', '8098946410', 'adilahaseen583224104002@nprcolleges.org', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b7ade885-349a-4495-9d94-806e614ceb79', '0e893d86-861d-4db1-8ace-866418eed506', 2, 'Leka saindhavi', 'NPR college of engineering', 'CSE', '3rd Year', '6380347127', 'lekaramesh05@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '83ae1898-6acb-47f6-afe2-5ce8c660bb88', '0e893d86-861d-4db1-8ace-866418eed506', 3, 'Charuvi', 'NPR college of engineering', 'CSE', '3rd Year', '9342764522', 'charuvibs583224104016@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8bac565b-611a-4cfd-b37f-fa7601106560', '0e893d86-861d-4db1-8ace-866418eed506', 4, 'Iniya gracelin mary', 'NPR college of engineering', 'CSE', '3rd Year', '9787527859', 'iniyagracelinmary583224104039@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3ba87b3c-b9db-4e7e-925d-d9a1b352aab6', '55e100b8-b217-452a-861f-a63e9be3420d', 1, 'VISHNU U', 'NPR COLLEGE OF ENGINEERING AND TECHNOLOGY', 'CSE', '3rd Year', '8300973914', 'vishnuu583224104120@nprcolleges.org', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '71ee3ed1-1898-490a-b342-0a905aa22492', '55e100b8-b217-452a-861f-a63e9be3420d', 2, 'RITHUPARAN M', 'NPR COLLEGE OF ENGINEERING AND TECHNOLOGY', 'CSE', '3rd Year', '6382963250', 'rithuparanm583224104086@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b26e9a4d-11b1-42df-a94b-e58a7dde82e6', '55e100b8-b217-452a-861f-a63e9be3420d', 3, 'SABAREESH M', 'NPR COLLEGE OF ENGINEERING AND TECHNOLOGY', 'CSE', '3rd Year', '7305138008', 'sabareeshk583224104089@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '316965c4-9ed4-4d7f-9ffb-c9479b611572', '55e100b8-b217-452a-861f-a63e9be3420d', 4, 'SUJAY ABISHEK M', 'NPR COLLEGE OF ENGINEERING AND TECHNOLOGY', 'CSE', '3rd Year', '9884148665', 'sujayabishekm583224104111@nprcolleges.org', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '522c71fb-dc73-4fa1-b03f-24a77121f2a5', '5b7a691a-1f4f-4b87-be0e-53438efc7bbb', 1, 'Srirangapprasath I', 'Rathinam Technical Campus, Coimbatore.', 'AI&DS', '2nd Year', '7639907884', 'rangapprasathsri@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '896afbc4-6792-472f-9327-e6e0bb738eae', '5b7a691a-1f4f-4b87-be0e-53438efc7bbb', 2, 'Vigneshselvan V', 'Rathinam Technical Campus', 'AI&DS', '2nd Year', '7598476340', 'vigneshselvanv.bai25@rathinam.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '23aff11f-abe6-41f9-bec9-96614220d20c', '5b7a691a-1f4f-4b87-be0e-53438efc7bbb', 3, 'Sudharsan S', 'Rathinam Technical Campus', 'AI&DS', '2nd Year', '7339612848', 'sudharsans.bai25@rathinam.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1be44ea1-723c-4a51-8289-5983b2c8fa2b', '5b7a691a-1f4f-4b87-be0e-53438efc7bbb', 4, 'Sandeepkumar S', 'Rathinam Technical Campus', 'AI&DS', '2nd Year', '7708287502', 'sandeepkumars.bai25@rathinam.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '18415793-7440-437b-ae02-cbad094ecda5', '60998cc3-2f5e-4b9b-a564-3468c012bb69', 1, 'SURIYAKUMAR E', 'RATHINAM TECHNICAL CAMPUS', 'BE CSE(AIML)', '2nd Year', '9445648373', 'suryaaswin000@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '874d6c36-4fd9-45b9-99dc-4520a2ed6791', '60998cc3-2f5e-4b9b-a564-3468c012bb69', 2, 'JEFFREY NICKALAS M', 'RATHINAM TECHNICAL CAMPUS', 'BE CSE(AIML)', '2nd Year', '7538872373', 'Jeffreyjn7.03@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0a25fcf4-c8b1-4e38-829e-1b58a7ca85a6', '60998cc3-2f5e-4b9b-a564-3468c012bb69', 3, 'KEVIN M', 'RATHINAM TECHNICAL CAMPUS', 'BE CSE', '1st Year', '9042344941', 'kevinnlouis2008@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f64538a2-6eae-40e1-a846-e7d8c48e45fa', '60998cc3-2f5e-4b9b-a564-3468c012bb69', 4, 'MOHAMMED JASIM J', 'RATHINAM TECHNICAL CAMPUS', 'BE CSE', '1st Year', '8056301592', 'mohammedjasim08122008@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6f96162e-be79-4f39-9477-457fbe91513f', 'e7ab6bed-d501-4349-aab9-bda1e3b5503b', 1, 'DURGA DEVI R', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '8015674318', 'durgadevir25@dsce.ac.in', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '93e66ae3-d83a-48f3-9de0-743bc8113bec', 'e7ab6bed-d501-4349-aab9-bda1e3b5503b', 2, 'ANUPRIYA D', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '9597914824', 'anupriyad25@dsce.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '853bd0e2-e042-4363-bda9-329e9a563699', 'e7ab6bed-d501-4349-aab9-bda1e3b5503b', 3, 'DEEPIKA P', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '8946092611', 'deepikap25@dsce.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '2a444f5b-907f-4c66-a026-efd7c3e07e7e', 'e7ab6bed-d501-4349-aab9-bda1e3b5503b', 4, 'ANAMIKA MS', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '9074808584', 'anamikams25@dsce.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '9c4f34e2-d401-44dd-9ad7-a2ec4c4956a6', '69cc9407-5f4e-4fb3-b840-09f22976fdcb', 1, 'Gowres M S', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '9952712633', 'mgowres@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'a2827124-c20a-4956-9e84-ae3c4d65dfab', '69cc9407-5f4e-4fb3-b840-09f22976fdcb', 2, 'Ananya A', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '8778597520', 'ananyaamuthan@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e02d0cda-5911-4585-ba3d-09048b7321a8', '69cc9407-5f4e-4fb3-b840-09f22976fdcb', 3, 'Tharakeswara D K', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '9080676382', 'tharakeswaradk02@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8158343b-77f8-44d1-9b5d-9a7bf50ab93d', '69cc9407-5f4e-4fb3-b840-09f22976fdcb', 4, 'Amritaa S', 'Dhanalakshmi Srinivasan College of Engineering', 'B.E/CSE', '2nd Year', '9751534323', 'amritaas546@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '6f90ea36-3946-4e3c-bb3f-df830e348196', '23a0f15b-0384-4061-8d5f-b1d3fc98f0ee', 1, 'Priyadharshini A', 'Dr.NGP Institute of Technology', 'Computer science and engineering', '2nd Year', '7200928794', 'priyadharshini00102@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cf72c4ce-da57-44a3-85d4-316661f4b6e6', '23a0f15b-0384-4061-8d5f-b1d3fc98f0ee', 2, 'Thejaswini D', 'Dr.NGP Institute of Technology', 'Computer science and engineering', '2nd Year', '7397269116', 'thejaswinid007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '2cc68083-0d15-4a40-96d2-dbec8f0a4eb5', '23a0f15b-0384-4061-8d5f-b1d3fc98f0ee', 3, 'SASI PRAKASH K', 'Dr.NGP Institute of Technology', 'Computer science and engineering', '2nd Year', '7395868648', 'k.sasiprakash648@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e2ef238a-5d14-4b79-b5c8-9ea9594c1e8b', '23a0f15b-0384-4061-8d5f-b1d3fc98f0ee', 4, 'VIKASH V', 'Dr.NGP Institute of Technology', 'Computer science and engineering', '2nd Year', '9384348237', 'vvikashv985@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'bec22856-b135-47c4-af19-77f88d3299c5', 'c0518126-5b99-473d-a086-5bb6fd40b211', 1, 'KOKILA B', 'Shree Venkateshwara hi-tech engineering college', 'CSE', '3rd Year', '7845625667', 'kokilakokila5768@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '38e008ed-5402-46cb-8d1f-bfbdcec76a9c', 'c0518126-5b99-473d-a086-5bb6fd40b211', 2, 'Jaganathan M', 'Shree Venkateshwara Hi tech Engineering College', 'CSE', '3rd Year', '7550324415', 'jaganathanmunusamy394@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1afb60fb-2f2b-4a2b-8633-da6fce1b0fb1', 'c0518126-5b99-473d-a086-5bb6fd40b211', 3, 'Jana krishnan C', 'Shree Venkateshwara Hi tech Engineering College', 'CSE', '3rd Year', '9345571586', 'jkjana35@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'bef1b0a2-78ba-4008-a7e1-0ee464164587', 'c0518126-5b99-473d-a086-5bb6fd40b211', 4, 'Hemavathi M', 'Shree Venkateshwara hi-tech engineering college', 'CSE', '3rd Year', '8778272082', 'hemamaharajhemamaharaj@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b3c98b3b-2e5f-4ba1-aa03-fcac533b6d01', '326c830e-9238-4789-adde-5179e080c00b', 1, 'Aashif K', 'Dhanalakshmi Srinivasan college of engineering', 'Computer science and engineering', '2nd Year', '8015107191', 'aashif2182007@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '52a02a2e-d1f6-44df-843c-f19880ba3159', '326c830e-9238-4789-adde-5179e080c00b', 2, 'Ameswar R I', 'Dhanalakshmi Srinivasan college of engineering', 'Computer science and engineering', '2nd Year', '7871829558', 'ameswarri@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '963c2dd1-8905-4574-84d1-dc01982b61d0', '326c830e-9238-4789-adde-5179e080c00b', 3, 'Abishek A', 'Dhanalakshmi Srinivasan college of engineering', 'Computer science and engineering', '2nd Year', '7395813688', 'abisheka20201@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cb876217-7301-4dd6-b555-01994070ac65', 'eea26f95-b17e-415e-a2f2-5682277da47c', 1, 'HEMALATHA C', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '8122217018', 'chemalatha382@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3d57eaea-b187-4264-adde-c5c79c3c9a10', 'eea26f95-b17e-415e-a2f2-5682277da47c', 2, 'METHUN SM', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '7810075278', 'smmethun2006@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cac4036f-805c-4808-9840-78943160db51', 'eea26f95-b17e-415e-a2f2-5682277da47c', 3, 'DEVADHARISHINI S', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '8300120386', 'saravanansdevadharshini@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e25bbcee-aba2-4582-b9bb-3ccc8cdb7101', 'eea26f95-b17e-415e-a2f2-5682277da47c', 4, 'JAYAKANTH V', 'SHREE VENKATESHWARA HI TECH ENGINEERING COLLEGE', 'BE.CSE', '3rd Year', '7604902089', 'jayakanthv17@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '0f935227-e0e6-4150-b7cc-ddc32352b721', '9952b707-565a-40e6-b091-eada0e82b9fc', 1, 'SAISARAN V', 'HINDUSTHAN COLLEGE OF ENGINEERING AND TECHNOLOGY', 'COMPUTER SCIENCE ENGINEERING', '1st Year', '7598019719', 'saisaran000777@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8d3f78bf-c2e6-4596-a67d-217f8c74779c', '9952b707-565a-40e6-b091-eada0e82b9fc', 2, 'SAM YESU DASAN W', 'HINDUSTAN COLLEGE OF ENGINEERING AND TECHNOLOGY', 'COMPUTER SCIENCE ENGINEERING', '1st Year', '9003221418', 'samyesudasan85@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'ed91fc1f-ecdc-4994-bab0-501e7cf22d7b', '9952b707-565a-40e6-b091-eada0e82b9fc', 3, 'KAILASH G', 'HINDUSTAN COLLEGE OF ENGINEERING AND TECHNOLOGY', 'COMPUTER SCIENCE ENGINEERING', '1st Year', '9489789921', 'kailash07@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c07c2282-4071-4ca8-87fc-ae71f2278cd6', '17ad3ef3-cacd-49db-b1e3-f6941af68eba', 1, 'kaniksha S', 'Shree Venkateswara hi-tech Engineering College', 'B.E computer science and Engineering', '3rd Year', '8111064688', 'kanikshakani047@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '10c3204c-d65f-48a6-a84b-02c92debaa80', '17ad3ef3-cacd-49db-b1e3-f6941af68eba', 2, 'HYRUNISHA.A', 'Shree Venkateshwara Hi-Tech Engineering College', 'B.E computer science and Engineering', '3rd Year', '9442172767', 'hyrun9442@gamil.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '95aae0b8-57cb-4728-b20f-21ae831a19ae', '17ad3ef3-cacd-49db-b1e3-f6941af68eba', 3, 'Dharanitharan M', 'Shree Venkateswara hi-tech Engineering College', 'B.E computer science and Engineering', '3rd Year', '9952350208', 'm.dharanitharan3024@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd6d20d3e-0761-4883-a7d0-2b86956e5ae9', '17ad3ef3-cacd-49db-b1e3-f6941af68eba', 4, 'Manikkavasakam A', 'Shree Venkateshwara Hi-Tech Engineering College', 'B.E Computer science and Engineering', '3rd Year', '9578389255', 'manikkavasakam26@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd614721b-d1f4-4ab3-a51c-55cd4a984032', 'b2257597-50b2-4208-8e0e-637dc2f7ce6e', 1, 'Abinayasree A', 'Shree Venkateswara Hi tech Engineering college', 'BE CSE', '3rd Year', '9025666340', 'abinayasri749@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '742fb34a-6f8f-404e-bc39-eefdbf9c6755', 'b2257597-50b2-4208-8e0e-637dc2f7ce6e', 2, 'Dhevak J', 'Shree Venkateswara Hi tech Engineering college', 'BE CSS', '3rd Year', '6383183895', 'dhevakdhevak030@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e20bd878-bea8-4e2a-96e4-f208deb0da4d', 'b2257597-50b2-4208-8e0e-637dc2f7ce6e', 3, 'Manoranjan P', 'Shree Venkateswara Hi tech Engineering college', 'BE CSE', '3rd Year', '6379745415', 'manoranjanp006@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c9b890fc-da35-4539-bc10-0b56a775b75a', 'e2345cb9-c91b-4e38-ab84-afb22067b073', 1, 'Thulasidharsan V', 'Mahendra Institute of technology', 'BE EEE', '3rd Year', '9791512551', 'thulasidharsan007@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '91d93552-96e7-476a-be9c-bcf32cf1d5b6', 'e2345cb9-c91b-4e38-ab84-afb22067b073', 2, 'R.SUDHARSAN', 'Mahendra Institute of technology', 'EEE', '3rd Year', '9344636161', 'sudharsan.r370@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '9d632233-43c7-4e5a-b6ef-1f3280437f41', 'e2345cb9-c91b-4e38-ab84-afb22067b073', 3, 'Roshan R', 'Mahendra Institute of technology', 'EEE', '3rd Year', '9384557766', 'rrogith40@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '734384ab-46ff-4a2b-bd33-669da1d29bb7', '005b4103-d87f-4915-a3aa-364a43bedadb', 1, 'SHACHIN A', 'Dhanalakshmi Srinivasan college of engineering coimbatore', 'Btech ai&ds', '2nd Year', '6382906526', 'shachin705@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '50b218f4-d5b0-480a-854c-fcff4e94b400', '005b4103-d87f-4915-a3aa-364a43bedadb', 2, 'SACHIN kumar L', 'Dhanalakshmi Srinivasan college of engineering coimbatore', 'Btech Ai ds', '2nd Year', '9047033329', 'sachinkumary400pro@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '047fe82c-36cc-4277-b816-eb48f590bf82', '005b4103-d87f-4915-a3aa-364a43bedadb', 3, 'Tamilselvan c', 'Dhanalakshmi Srinivasan college of engineering coimbatore', 'Btech Ai ds', '2nd Year', '8220958496', 'tamilselvantn2007@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '3719a6b6-1324-47e3-867b-745ad38a0690', '005b4103-d87f-4915-a3aa-364a43bedadb', 4, 'Surya L', 'Dhanalakshmi Srinivasan college of engineering coimbatore', 'Btech AI ds', '2nd Year', '8925056403', 'suryalakshmanan145@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '42a1ac01-6f96-4ef2-96f3-0f1ccb40da3d', 'ab1f1059-cb57-4f23-a117-c18f6e6f4b7d', 1, 'A.Arshun Noufiya', 'KPR institute of engineering and technology', 'Artificial intelligence and data', '2nd Year', '8778793367', '25ad015@kpriet.ac.in', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '64b54af1-b086-41a3-a4c6-c35ffdecf266', 'ab1f1059-cb57-4f23-a117-c18f6e6f4b7d', 2, 'Dhanya BT', 'KPR institute of engineering and technology', 'Artificial intelligence and data science', '2nd Year', '8248063874', '25ad029@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c528a346-c597-42a5-be00-9bd8a299f4a9', 'ab1f1059-cb57-4f23-a117-c18f6e6f4b7d', 3, 'Preethiga AT', 'KPR institute of engineering and technology', 'Information technology', '3rd Year', '7010180588', '25it125@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '634317f1-68a9-44fd-a8d3-bb5fcb1b97d4', 'ab1f1059-cb57-4f23-a117-c18f6e6f4b7d', 4, 'Kanishka', 'KPR institute of engineering and technology', 'Electronics and communication engineering', '2nd Year', '8015746464', '25ec094@kpriet.ac.in', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b0f14537-f27a-4e5e-adb3-021158680334', '713580c1-d246-4327-85d3-d3f921e987af', 1, 'ARAVINDHAN S', 'ERODE SENGUNTHAR ENGINEERING COLLEGE', 'ELECTRICAL AND ELECTRONICS ENGINEERING', '3rd Year', '6381944469', 'aravindhanofficial83@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '08ca804f-320b-48b9-861e-7f36b7e1ea1b', '713580c1-d246-4327-85d3-d3f921e987af', 2, 'SOBIKA G', 'Shree Venkateshwara Hi-Tech Engineering College', 'COMPUTER SCIENCE ENGINEERING', '3rd Year', '9344088639', 'sobika882@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '42616139-ca2d-4b15-ab0d-9109ad942bed', '713580c1-d246-4327-85d3-d3f921e987af', 3, 'RESHMA M', 'Shree Venkateshwara Hi-Tech Engineering College', 'COMPUTER SCIENCE ENGINEERING', '3rd Year', '7845545791', 'r32241116@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '180b4870-7892-4c76-82ea-a85ab925f20e', 'fa06c63f-b6a4-493e-beb9-a73e03f58fa3', 1, 'Dhanush RJ', 'KLN college of engineering', 'Information technology', '3rd Year', '9361820110', 'dhanushrj3906@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '1b4c429a-51fb-453a-9bcc-b410d2c85b0d', 'fa06c63f-b6a4-493e-beb9-a73e03f58fa3', 2, 'Devakumar RB', 'KLN college of engineering', 'Information technology', '3rd Year', '8015241410', 'devakumar010407@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e7cbbf75-e467-4d5b-bad5-422d0f9c0178', 'fa06c63f-b6a4-493e-beb9-a73e03f58fa3', 3, 'Charumathi R', 'KLN college of engineering', 'Information technology', '3rd Year', '8903499335', '2607selene@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'faf76058-857f-4b50-b83c-b49cbe6f9a5b', 'fa06c63f-b6a4-493e-beb9-a73e03f58fa3', 4, 'Swathy RB', 'KLN college of engineering', 'Information technology', '3rd Year', '7339091095', 'rbswathy37@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'bd3b4972-e341-4808-beb0-6ad667eb1e47', '4ba72158-c51d-4c6c-9785-a73de33a0e31', 1, 'Dharshini Sri R', 'K.L.N College of Engineering', 'Information Technology', '3rd Year', '9092636338', 'dharshinisri23052007@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd175c80c-0845-4664-a8da-7baa17bdac37', '4ba72158-c51d-4c6c-9785-a73de33a0e31', 2, 'Karthikeyan S', 'K.L.N College of Engineering', 'Information Technology', '3rd Year', '9751313052', 'karthikeyan05102006@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'cbc8a67b-cd5a-4df8-9fe9-b078d8d529fb', '4ba72158-c51d-4c6c-9785-a73de33a0e31', 3, 'Harini P', 'K.L.N College of Engineering', 'Information Technology', '3rd Year', '9629679615', '2402harini@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '7fa2475c-e117-4bab-9975-da2bf36c85a8', '4ba72158-c51d-4c6c-9785-a73de33a0e31', 4, 'Yugeshram S', 'K.L.N College of Engineering', 'Mechanical', '3rd Year', '8825447905', 'yugeshram2k7@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '8a666f32-770c-4db8-a10e-bf0bd0bf352d', '7a5c9245-7ce0-42a8-9b8f-876c6db40e0c', 1, 'Sugapriya S', 'K.L.N.College Of Engineering', 'Information Technology', '3rd Year', '9843702299', 'sugapriya2706@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'b01a263e-718a-4cba-8c75-bca3cf47d9db', '7a5c9245-7ce0-42a8-9b8f-876c6db40e0c', 2, 'Mahima Natarajan', 'K.L.N.College Of Engineering', 'Information Technology', '3rd Year', '6383676129', 'mahimanatarajan1710@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f964760e-bc39-4c6b-8896-13c733b30090', '7a5c9245-7ce0-42a8-9b8f-876c6db40e0c', 3, 'Name: Vijaya Deepa P', 'K.L.N.College Of Engineering', 'Information Technology', '3rd Year', '9659966376', 'vijayadeepa16@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  '5837b269-b8f4-4b76-86ec-4d326b49870e', '7a5c9245-7ce0-42a8-9b8f-876c6db40e0c', 4, 'Thajesh Shalini S', 'K.l.N.College Of Engineering', 'Information Technology', '3rd Year', '9943818512', 'gamitsquad2025@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'f1a8c92b-8c4d-4e9a-0b2e-83f596ba04c2', '24c8b91a-7b3c-4e8f-9a1d-72e485a9f3b1', 1, 'Muthukumar G', 'Paavai Engineering College', 'B.Tech - Information Technology', '3rd Year', '7868093944', 'muthusarankcy123@gmail.com', TRUE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'e2b9d03c-9d5e-4f0b-1c3f-94a607cb15d3', '24c8b91a-7b3c-4e8f-9a1d-72e485a9f3b1', 2, 'Karthik priyan', 'Paavai Engineering College', 'B.Tech - Information Technology', '3rd Year', '6379918853', 'k69630348@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'd3cae14d-0e6f-4a1c-2d4a-05b718dc26e4', '24c8b91a-7b3c-4e8f-9a1d-72e485a9f3b1', 3, 'Kowsalya J', 'Paavai Engineering College', 'B.Tech - Information Technology', '3rd Year', '9363377606', 'kowsalyaj26@gmail.com', FALSE, timezone('utc'::text, now())
);
INSERT INTO public.team_members (
  id, team_id, member_order, name, college, department, year_of_study, whatsapp, email, is_leader, created_at
) VALUES (
  'c4dbf25e-1f7a-4b2d-3e5b-16c829ed37f5', '24c8b91a-7b3c-4e8f-9a1d-72e485a9f3b1', 4, 'Kanishka.S', 'Paavai Engineering College', 'B.Tech - Information Technology', '3rd Year', '8098972077', 'kanishkashanmugam3107@gmail.com', FALSE, timezone('utc'::text, now())
);

-- 4. Accommodation Requests (9 Requests)
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '00c1cda8-e816-4c93-8b3d-c980fe136db0', 'SHF26-ACC-001HGKN', '0e490975-3079-4456-baa0-91f67f650992', 'SHF26-5UCTEA', 'Nexthub', 4, 100, 400,
  '627737512424', 'https://drive.google.com/file/d/1Fr8HexDvuORgba0CeJg0hZflDxrC8P9-/view?usp=drivesdk', 'PENDING', 'Gavutham G', 'gavutham07@gmail.com',
  '2026-04-10 21:02:09+00', '2026-04-10 21:02:09+00', '2026-04-10 21:02:09+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '9db14d9e-c309-4d53-8460-2671ff468407', 'SHF26-ACC-002K9GU', '2a601fcf-f367-4e61-ad08-d9ca49a9f2fd', 'SHF26-CWSF6E', 'MindTheGap', 3, 100, 300,
  '627702126261', 'https://drive.google.com/file/d/1bsVNS0VzKRiOEtn59LsGdVsiC1ajHIf2/view?usp=drivesdk', 'PENDING', 'M Kaarthik', 'kaarthik.m2005@gmail.com',
  '2026-04-10 21:06:06+00', '2026-04-10 21:06:06+00', '2026-04-10 21:06:06+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '811677e9-f00f-4ba3-87d0-ec8b6e4c682e', 'SHF26-ACC-0035Q6G', '5b27b595-893e-423f-9baf-259f302fb172', 'SHF26-SBATU3', 'The Debuggers', 4, 100, 400,
  '627734600257', 'https://drive.google.com/file/d/1gh_L9yzCQFh9J0ioUEgHZZMP6ra5eKII/view?usp=drivesdk', 'PENDING', 'Sanjay J', 'sanjayjothilingam@gmail.com',
  '2026-04-10 21:13:23+00', '2026-04-10 21:13:23+00', '2026-04-10 21:13:23+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '9cd2cc1f-956b-45d1-b2db-9ec8c66d8f6d', 'SHF26-ACC-0045HB7', '1657ca50-1aa6-462c-b385-302eba69df0c', 'SHF26-S3CHSG', 'INNOVERS', 4, 100, 400,
  '664320059519', 'https://drive.google.com/file/d/1U17z2PIthZDxevr5vxna-xOW6CJktXOR/view?usp=drivesdk', 'PENDING', 'GNANESHWER R', 'selvaraju14feb@gmail.com',
  '2026-04-10 21:22:28+00', '2026-04-10 21:22:28+00', '2026-04-10 21:22:28+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '5e6bf428-083f-45e8-8f9a-e7fa86ddd67e', 'SHF26-ACC-005RORW', '69cc9407-5f4e-4fb3-b840-09f22976fdcb', 'SHF26-Z2Q8HY', 'Tag Coders', 2, 100, 200,
  '627897435099', 'https://drive.google.com/file/d/1GIVgGcWoe36II-AHciPD8r1EZV_1A65f/view?usp=drivesdk', 'PENDING', 'Gowres M S', 'mgowres@gmail.com',
  '2026-05-10 11:05:58+00', '2026-05-10 11:05:58+00', '2026-05-10 11:05:58+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '8a904fcf-b666-4ad7-8c44-c054e4366540', 'SHF26-ACC-0065XSN', 'c40f3574-d14f-429b-bbe4-707d02619f6b', 'SHF26-YVWPW5', 'QUAD-A CODERS', 2, 100, 200,
  '627829248601', 'https://drive.google.com/file/d/1TOgOfhXFIeD430nFVdE5ZXqa_zweRcxq/view?usp=drivesdk', 'PENDING', 'ABISEK P', 'abisekp25@dsce.ac.in',
  '2026-05-10 11:18:19+00', '2026-05-10 11:18:19+00', '2026-05-10 11:18:19+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '13903654-5491-4487-91cb-0ad37181a2ca', 'SHF26-ACC-007BI90', '4a06f8f2-7067-4d51-b038-2e49f35a3383', 'SHF26-LDXURB', 'DecodeX', 4, 100, 400,
  '627986975944', 'https://drive.google.com/file/d/1QwySksz32b8n2BCUjB84MjkYF6AaDkik/view?usp=drivesdk', 'PENDING', 'Jasima Firadouse', 'jasimafiradouse@gmail.com',
  '2026-06-10 10:37:55+00', '2026-06-10 10:37:55+00', '2026-06-10 10:37:55+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '98daa0f5-1248-4a88-8a7f-9ae705da400b', 'SHF26-ACC-00851OH', 'e2345cb9-c91b-4e38-ab84-afb22067b073', 'SHF26-N3XSYQ', 'Spark Arise', 3, 100, 300,
  '627990179240', 'https://drive.google.com/file/d/1yuhTbWq5br0v69_sgQNnB0cpfgpIk1aI/view?usp=drivesdk', 'PENDING', 'Thulasidharsan V', 'thulasidharsan007@gmail.com',
  '2026-06-10 11:28:59+00', '2026-06-10 11:28:59+00', '2026-06-10 11:28:59+00'
) ON CONFLICT (accommodation_id) DO NOTHING;
INSERT INTO public.accommodation_requests (
  id, accommodation_id, team_id, team_code, team_name, member_count, rate_per_member, total_amount,
  upi_transaction_id, payment_screenshot_url, payment_status, team_leader_name, team_leader_email,
  request_timestamp, created_at, updated_at
) VALUES (
  '29a0d19a-f83e-486e-8dc7-e44883ae9e5a', 'SHF26-ACC-00913HE', 'c4b9161e-44af-4c9b-ad29-632a21488011', 'SHF26-9YQS3H', 'GRACE BEES', 2, 100, 200,
  '664588151826', 'https://drive.google.com/file/d/1vEkrxyn1OtSHceMfjMePkgxYiXE8ExrB/view?usp=drivesdk', 'PENDING', 'J.JOHANNIE RINAH', 'johannierinah3@gmail.com',
  '2026-06-10 12:13:45+00', '2026-06-10 12:13:45+00', '2026-06-10 12:13:45+00'
) ON CONFLICT (accommodation_id) DO NOTHING;

-- 5. Accommodation Members (28 Members)
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '00c1cda8-e816-4c93-8b3d-c980fe136db0', 'ee4106f0-3b50-473e-8ccd-493008d897a6', 'Gavutham G', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '00c1cda8-e816-4c93-8b3d-c980fe136db0', '3b216321-ecfe-4c2d-83a9-f34b743fff36', 'Sinduja K', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '00c1cda8-e816-4c93-8b3d-c980fe136db0', '9f768bc3-c5ea-43b2-b16a-33a544c9430a', 'MohanaKumar L', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '00c1cda8-e816-4c93-8b3d-c980fe136db0', 'dfa537b4-5077-4ecc-b6d1-4280e4d25c3c', 'Amrutha Shree S', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '9db14d9e-c309-4d53-8460-2671ff468407', 'de855e59-5de5-4547-ba1f-d3592e068519', 'Pavan Kalyan K', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '9db14d9e-c309-4d53-8460-2671ff468407', 'fb2f7da6-836c-4b28-bdbd-7f28a9dc8428', 'S R Sathi Vikash', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '9db14d9e-c309-4d53-8460-2671ff468407', '55eadbb4-67bf-45dc-adaa-853c5edac808', 'M Kaarthik', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '811677e9-f00f-4ba3-87d0-ec8b6e4c682e', '44774c1e-b9cd-4ce1-890f-b0bb9c2c1246', 'Sanjay J', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '811677e9-f00f-4ba3-87d0-ec8b6e4c682e', '7e5d5e3f-2bae-4a8e-b2ad-8c536c6552b1', 'Gugaan M', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '811677e9-f00f-4ba3-87d0-ec8b6e4c682e', '6301fd83-b31d-4789-bf2b-eab8ce4dfcd4', 'T R Chandhana', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '811677e9-f00f-4ba3-87d0-ec8b6e4c682e', '1603ac2f-fba1-4e4e-92bb-9cdcc83df326', 'Madhumitha N', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '9cd2cc1f-956b-45d1-b2db-9ec8c66d8f6d', 'a2a715d3-1781-415c-9b1e-b14457918da5', 'GNANESHWER R', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '9cd2cc1f-956b-45d1-b2db-9ec8c66d8f6d', 'f7da55b8-aa2c-4f42-b30f-f86728fde35c', 'JANANI A', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '9cd2cc1f-956b-45d1-b2db-9ec8c66d8f6d', 'eba1d95b-6c71-4f25-afd1-7a59d20bbe79', 'SHUBASHREE TN', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '9cd2cc1f-956b-45d1-b2db-9ec8c66d8f6d', '962a5b82-3758-4b3c-9a4f-d478acf32c54', 'KALKISHREE R', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '5e6bf428-083f-45e8-8f9a-e7fa86ddd67e', '9c4f34e2-d401-44dd-9ad7-a2ec4c4956a6', 'Gowres M S', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '5e6bf428-083f-45e8-8f9a-e7fa86ddd67e', 'e02d0cda-5911-4585-ba3d-09048b7321a8', 'Tharakeswara D K', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '8a904fcf-b666-4ad7-8c44-c054e4366540', 'a0b0024c-ee22-439d-875b-775802242d77', 'ARUL CT', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '8a904fcf-b666-4ad7-8c44-c054e4366540', '8d058e61-20b9-4355-93b0-c4359d427e9a', 'ANAND A', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '13903654-5491-4487-91cb-0ad37181a2ca', '53bc8c52-938e-4f03-adce-3a9ff382fa1e', 'Nazreen Taj', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '13903654-5491-4487-91cb-0ad37181a2ca', '82cbde7d-9e52-4404-b571-79c0d810c127', 'Ahamed Nawaz', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '13903654-5491-4487-91cb-0ad37181a2ca', 'af2c27b8-d489-4b76-92da-ea28aab7d6c4', 'Faheem ahamed', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '13903654-5491-4487-91cb-0ad37181a2ca', 'c754a337-c62d-4ec7-b840-4368c224d0e0', 'Jasima Firadouse', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '98daa0f5-1248-4a88-8a7f-9ae705da400b', 'c9b890fc-da35-4539-bc10-0b56a775b75a', 'Thulasidharsan V', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '98daa0f5-1248-4a88-8a7f-9ae705da400b', '91d93552-96e7-476a-be9c-bcf32cf1d5b6', 'R.SUDHARSAN', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '98daa0f5-1248-4a88-8a7f-9ae705da400b', '9d632233-43c7-4e5a-b6ef-1f3280437f41', 'Roshan R', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '29a0d19a-f83e-486e-8dc7-e44883ae9e5a', '270fc887-1ce7-43d8-9354-9714d1fe95cf', 'J.JOHANNIE RINAH', timezone('utc'::text, now())
);
INSERT INTO public.accommodation_members (
  id, accommodation_request_id, team_member_id, member_name, created_at
) VALUES (
  gen_random_uuid(), '29a0d19a-f83e-486e-8dc7-e44883ae9e5a', '382ec6c9-608e-482f-bcf0-cf47fb65f3c0', 'R.NICE REENA', timezone('utc'::text, now())
);
