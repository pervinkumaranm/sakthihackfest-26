import { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, Upload, CheckCircle2, AlertCircle,
  Loader2, ShieldCheck, RefreshCw, Trash2,
  Users, Phone, Mail, FileText, ArrowRight, User
} from 'lucide-react'
import { EVENT_CONFIG } from '../../config/eventConfig'
import { registrationFormSchema, RegistrationFormValues, ACADEMIC_YEARS } from '../../config/registrationSchema'
import { apiService } from '../services/api'

type Step = 1 | 2 | 3

const inputClass =
  'w-full bg-brand-bg border border-brand-border text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-brand-primary transition-colors placeholder-brand-muted/40 font-mono'
const selectClass =
  'w-full bg-brand-bg border border-brand-border text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-brand-primary transition-colors font-mono cursor-pointer'
const labelClass = 'block font-mono text-xs tracking-widest text-brand-muted mb-2'
const errorClass = 'mt-1.5 text-xs text-red-400 font-mono flex items-center gap-1'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className={errorClass}>
      <AlertCircle size={12} /> {message}
    </p>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [submissionStage, setSubmissionStage] = useState<number>(0)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotFileName, setScreenshotFileName] = useState('')
  const [screenshotError, setScreenshotError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      teamName: '',
      teamSize: 3,
      leaderName: '',
      leaderDepartment: '',
      leaderYear: '3rd Year',
      leaderWhatsapp: '',
      leaderEmail: '',
      members: [
        { name: '', department: '', yearOfStudy: '3rd Year', whatsapp: '', email: '' },
        { name: '', department: '', yearOfStudy: '3rd Year', whatsapp: '', email: '' },
      ],
      paymentScreenshotData: '',
      paymentScreenshotName: '',
      upiTransactionId: '',
      confirmedCorrect: false,
    },
    mode: 'onTouched',
  })

  const selectedTeamSize = watch('teamSize') || 3
  const watchedValues = watch()

  const { fields, replace } = useFieldArray({ control, name: 'members' })

  // Sync member count = teamSize - 1
  useEffect(() => {
    const required = selectedTeamSize - 1
    const current = watch('members') || []
    if (current.length !== required) {
      const next = []
      for (let i = 0; i < required; i++) {
        next.push(
          current[i] || {
            name: '',
            department: '',
            yearOfStudy: '3rd Year',
            whatsapp: '',
            email: '',
          }
        )
      }
      replace(next)
    }
  }, [selectedTeamSize, replace])

  // File upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshotError('')
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setScreenshotError('Only PNG, JPG, JPEG, or WEBP image files are accepted.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError('File size exceeds 5 MB. Please upload a compressed image.')
      return
    }
    const reader = new FileReader()
    reader.onload = event => {
      const base64 = event.target?.result as string
      setScreenshotPreview(base64)
      setScreenshotFileName(file.name)
      setValue('paymentScreenshotData', base64, { shouldValidate: true })
      setValue('paymentScreenshotName', file.name)
    }
    reader.onerror = () => setScreenshotError('Failed to read file. Please try again.')
    reader.readAsDataURL(file)
  }

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const syntheticEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
    handleFileChange(syntheticEvent)
  }

  const removeScreenshot = () => {
    setScreenshotPreview(null)
    setScreenshotFileName('')
    setValue('paymentScreenshotData', '', { shouldValidate: true })
    setValue('paymentScreenshotName', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Step validation
  const handleNext = async () => {
    setServerError('')
    if (step === 1) {
      const valid = await trigger([
        'teamName', 'teamSize',
        'leaderName', 'leaderDepartment', 'leaderYear', 'leaderWhatsapp', 'leaderEmail',
      ])
      if (valid) {
        setStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (step === 2) {
      const valid = await trigger(['members'])
      if (valid) {
        setStep(3)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    setServerError('')
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final submission with Multi-Stage Progress UI
  const onSubmit = async (values: RegistrationFormValues) => {
    setSubmitting(true)
    setServerError('')
    setSubmissionStage(1) // STEP 1: VERIFYING DETAILS

    try {
      await new Promise(r => setTimeout(r, 400))
      setSubmissionStage(2) // STEP 2: UPLOADING PAYMENT

      const uploadStepDelay = new Promise(r => setTimeout(r, 600))
      const submitPromise = apiService.submitRegistration({
        teamName: values.teamName.trim(),
        teamSize: values.teamSize,
        leaderName: values.leaderName.trim(),
        leaderDepartment: values.leaderDepartment.trim(),
        leaderYear: values.leaderYear.trim(),
        leaderWhatsapp: values.leaderWhatsapp.trim(),
        leaderEmail: values.leaderEmail.trim(),
        members: values.members.map(m => ({
          name: m.name.trim(),
          department: m.department.trim(),
          yearOfStudy: m.yearOfStudy.trim(),
          whatsapp: m.whatsapp.trim(),
          email: m.email.trim(),
        })),
        paymentAmount: EVENT_CONFIG.registrationFee,
        paymentScreenshotName: values.paymentScreenshotName || screenshotFileName,
        paymentScreenshotData: values.paymentScreenshotData,
        upiTransactionId: values.upiTransactionId.trim(),
      })

      await uploadStepDelay
      setSubmissionStage(3) // STEP 3: SAVING REGISTRATION

      const response = await submitPromise

      if (response.success && response.data) {
        setSubmissionStage(4) // STEP 4: SENDING CONFIRMATION
        await new Promise(r => setTimeout(r, 550))

        setSubmissionStage(5) // STEP 5: GENERATING REGISTRATION PASS
        await new Promise(r => setTimeout(r, 550))

        setSubmissionStage(6) // REGISTRATION CONFIRMED
        await new Promise(r => setTimeout(r, 700))

        navigate('/success', { state: { registration: response.data } })
      } else {
        setSubmitting(false)
        setSubmissionStage(0)
        setServerError(response.error || 'Registration submission failed. Please try again.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setSubmitting(false)
      setSubmissionStage(0)
      setServerError('An unexpected error occurred. Please try again.')
    }
  }

  const STEP_LABELS = ['TEAM & LEADER', 'TEAM MEMBERS', 'PAYMENT']

  return (
    <main className="min-h-screen bg-brand-bg pt-20 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="bg-cyber-grid-dense absolute inset-0 opacity-40 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <span className="font-mono text-xs text-brand-muted group-hover:text-brand-primary transition-colors">
              ← BACK TO HOME
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2 font-mono text-xs tracking-widest text-brand-primary uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span>{EVENT_CONFIG.eventName} OFFICIAL REGISTRATION</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            {step === 1 && <>BUILD YOUR <span className="text-brand-primary">TEAM</span></>}
            {step === 2 && <>ADD <span className="text-brand-primary">MEMBERS</span></>}
            {step === 3 && <>SECURE YOUR <span className="text-brand-primary">SPOT</span></>}
          </h1>
          <p className="mt-2 font-mono text-xs sm:text-sm text-brand-muted">
            {EVENT_CONFIG.eventDate} · Fee: {EVENT_CONFIG.feeDisplay} per team
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-10 bg-brand-card/80 border border-brand-border/80 p-4 rounded-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs sm:text-sm tracking-widest text-white">
                STEP {step} OF 3
              </span>
              <span className="text-brand-border">|</span>
              <span className="font-mono text-xs text-brand-primary uppercase">
                {STEP_LABELS[step - 1]}
              </span>
            </div>
            <span className="font-mono text-xs text-brand-muted">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-brand-border/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-orange to-brand-primary"
              initial={{ width: '33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-brand-border/40 text-center">
            {STEP_LABELS.map((label, i) => (
              <div
                key={i}
                className={`font-mono text-[10px] tracking-wider transition-colors ${
                  step === i + 1
                    ? 'text-brand-primary font-bold'
                    : step > i + 1
                    ? 'text-emerald-400'
                    : 'text-brand-muted'
                }`}
              >
                {step > i + 1 ? '✓ ' : ''}0{i + 1}. {label}
              </div>
            ))}
          </div>
        </div>

        {/* Server Error */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 border border-red-500/50 bg-red-950/30 rounded-lg flex items-start gap-3 text-red-300 text-sm"
          >
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold font-display">Registration Error</div>
              <div>{serverError}</div>
            </div>
          </motion.div>
        )}

        {/* Multi-Step Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">

            {/* ================================================================ */}
            {/* STEP 1 — TEAM & LEADER                                           */}
            {/* ================================================================ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Team Information Card */}
                <div className="bg-brand-card/90 border border-brand-border p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-md space-y-6">
                  <div className="border-b border-brand-border/60 pb-4">
                    <h2 className="font-display font-black text-xl text-white tracking-wide flex items-center gap-2">
                      <Users className="text-brand-primary" size={20} />
                      TEAM INFORMATION
                    </h2>
                    <p className="text-xs text-brand-muted font-mono mt-1">
                      Let's start with your team and team leader.
                    </p>
                  </div>

                  {/* Team Name */}
                  <div>
                    <label className={labelClass}>
                      TEAM NAME <span className="text-brand-primary">*</span>
                    </label>
                    <input
                      {...register('teamName')}
                      placeholder="e.g. Code Titans"
                      className={inputClass}
                    />
                    <FieldError message={errors.teamName?.message} />
                  </div>

                  {/* Team Size */}
                  <div>
                    <label className={labelClass}>
                      TEAM SIZE <span className="text-brand-primary">*</span>
                      <span className="text-brand-muted ml-2 font-normal text-[11px]">(Leader + 1 to 3 co-engineers)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {EVENT_CONFIG.teamSizeOptions.map(opt => {
                        const isSelected = selectedTeamSize === opt.value
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setValue('teamSize', opt.value, { shouldValidate: true })}
                            className={`py-3.5 px-3 rounded-lg border text-center font-mono text-xs sm:text-sm tracking-wider transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'border-brand-primary bg-brand-primary/15 text-white shadow-[0_0_15px_rgba(255,59,48,0.25)] font-bold'
                                : 'border-brand-border bg-brand-bg text-brand-muted hover:border-brand-border/90 hover:text-white'
                            }`}
                          >
                            <Users size={16} className={isSelected ? 'text-brand-primary' : 'text-brand-muted'} />
                            <span>{opt.label}</span>
                            <span className="text-[10px] opacity-70">
                              {opt.value === 2 ? '1 TL + 1 Member' : opt.value === 3 ? '1 TL + 2 Members' : '1 TL + 3 Members'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <FieldError message={errors.teamSize?.message} />
                  </div>
                </div>

                {/* Team Leader Details Card */}
                <div className="bg-brand-card/90 border border-brand-primary/40 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-md space-y-5 relative">
                  <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                    <div>
                      <span className="font-mono text-[10px] tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/30">
                        PRIMARY CONTACT
                      </span>
                      <h2 className="font-display font-black text-xl text-white tracking-wide mt-1 flex items-center gap-2">
                        <User size={18} className="text-brand-primary" />
                        TEAM LEADER DETAILS
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-brand-muted">MEMBER 01</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Leader Name */}
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        TEAM LEADER NAME <span className="text-brand-primary">*</span>
                      </label>
                      <input
                        {...register('leaderName')}
                        placeholder="Enter team leader's full name"
                        className={inputClass}
                      />
                      <FieldError message={errors.leaderName?.message} />
                    </div>

                    {/* Department */}
                    <div>
                      <label className={labelClass}>
                        DEPARTMENT <span className="text-brand-primary">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('leaderDepartment')}
                        placeholder="Enter your department / branch"
                        className={inputClass}
                      />
                      <FieldError message={errors.leaderDepartment?.message} />
                    </div>

                    {/* Year of Study */}
                    <div>
                      <label className={labelClass}>
                        YEAR OF STUDY <span className="text-brand-primary">*</span>
                      </label>
                      <select {...register('leaderYear')} className={selectClass}>
                        {ACADEMIC_YEARS.map(y => (
                          <option key={y} value={y} className="bg-brand-card">{y}</option>
                        ))}
                      </select>
                      <FieldError message={errors.leaderYear?.message} />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className={labelClass}>
                        WHATSAPP NUMBER <span className="text-brand-primary">*</span>
                      </label>
                      <div className="flex items-center gap-0">
                        <span className="flex items-center gap-1 px-3 py-3 bg-brand-surface border border-r-0 border-brand-border rounded-l-lg font-mono text-xs text-brand-muted whitespace-nowrap">
                          <Phone size={12} className="text-brand-primary" /> +91
                        </span>
                        <input
                          {...register('leaderWhatsapp')}
                          placeholder="WhatsApp Number"
                          maxLength={10}
                          className="flex-1 bg-brand-bg border border-brand-border rounded-r-lg text-white text-sm px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors font-mono placeholder-brand-muted/40"
                        />
                      </div>
                      <FieldError message={errors.leaderWhatsapp?.message} />
                    </div>

                    {/* Email */}
                    <div>
                      <label className={labelClass}>
                        E-MAIL <span className="text-brand-primary">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="flex items-center gap-1 px-3 py-3 bg-brand-surface border border-r-0 border-brand-border rounded-l-lg font-mono text-xs text-brand-muted">
                          <Mail size={12} className="text-brand-primary" />
                        </span>
                        <input
                          {...register('leaderEmail')}
                          type="email"
                          placeholder="leader@email.com"
                          className="flex-1 bg-brand-bg border border-brand-border rounded-r-lg text-white text-sm px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors font-mono placeholder-brand-muted/40"
                        />
                      </div>
                      <FieldError message={errors.leaderEmail?.message} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================================================================ */}
            {/* STEP 2 — TEAM MEMBERS                                            */}
            {/* ================================================================ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header Card */}
                <div className="bg-brand-card/90 border border-brand-border p-6 rounded-xl backdrop-blur-md">
                  <h2 className="font-display font-black text-xl text-white tracking-wide flex items-center gap-2">
                    <Users className="text-brand-orange" size={20} />
                    TEAM MEMBERS DETAILS
                  </h2>
                  <p className="text-xs text-brand-muted font-mono mt-1">
                    Add details of the remaining team members. The team leader has already been registered in Step 1.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="font-mono text-[11px] text-brand-primary bg-brand-primary/10 border border-brand-primary/30 px-2.5 py-1 rounded">
                      TEAM: {watchedValues.teamName}
                    </span>
                    <span className="font-mono text-[11px] text-brand-orange bg-brand-orange/10 border border-brand-orange/30 px-2.5 py-1 rounded">
                      LEADER: {watchedValues.leaderName}
                    </span>
                    <span className="font-mono text-[11px] text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                      {selectedTeamSize - 1} MORE MEMBER{selectedTeamSize - 1 > 1 ? 'S' : ''} REQUIRED
                    </span>
                  </div>
                </div>

                {/* Member Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {fields.map((field, index) => {
                    const memberNumber = index + 2
                    const memberErrors = errors.members?.[index]
                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.06 }}
                        className="bg-brand-card/90 border border-brand-border p-5 rounded-xl shadow-xl backdrop-blur-md space-y-4 flex flex-col"
                      >
                        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                          <h3 className="font-display font-black text-lg text-white tracking-wide">
                            MEMBER {String(memberNumber).padStart(2, '0')}
                          </h3>
                          <span className="font-mono text-xs text-brand-orange">CO-ENGINEER</span>
                        </div>

                        {/* Name */}
                        <div>
                          <label className={labelClass}>
                            NAME <span className="text-brand-primary">*</span>
                          </label>
                          <input
                            {...register(`members.${index}.name` as const)}
                            placeholder={`Member ${String(memberNumber).padStart(2, '0')} full name`}
                            className={inputClass}
                          />
                          <FieldError message={memberErrors?.name?.message} />
                        </div>

                        {/* Department */}
                        <div>
                          <label className={labelClass}>
                            DEPARTMENT <span className="text-brand-primary">*</span>
                          </label>
                          <input
                            type="text"
                            {...register(`members.${index}.department` as const)}
                            placeholder="Enter your department / branch"
                            className={inputClass}
                          />
                          <FieldError message={memberErrors?.department?.message} />
                        </div>

                        {/* Year of Study */}
                        <div>
                          <label className={labelClass}>
                            YEAR OF STUDY <span className="text-brand-primary">*</span>
                          </label>
                          <select
                            {...register(`members.${index}.yearOfStudy` as const)}
                            className={selectClass}
                          >
                            {ACADEMIC_YEARS.map(y => (
                              <option key={y} value={y} className="bg-brand-card">{y}</option>
                            ))}
                          </select>
                          <FieldError message={memberErrors?.yearOfStudy?.message} />
                        </div>

                        {/* WhatsApp & Email */}
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className={labelClass}>
                              WHATSAPP <span className="text-brand-primary">*</span>
                            </label>
                            <div className="flex items-center gap-0">
                              <span className="flex items-center gap-1 px-3 py-3 bg-brand-surface border border-r-0 border-brand-border rounded-l-lg font-mono text-xs text-brand-muted">
                                <Phone size={11} className="text-brand-primary" /> +91
                              </span>
                              <input
                                {...register(`members.${index}.whatsapp` as const)}
                                placeholder="10-digit number"
                                maxLength={10}
                                className="flex-1 bg-brand-bg border border-brand-border rounded-r-lg text-white text-sm px-3 py-3 focus:outline-none focus:border-brand-primary transition-colors font-mono placeholder-brand-muted/40"
                              />
                            </div>
                            <FieldError message={memberErrors?.whatsapp?.message} />
                          </div>

                          <div>
                            <label className={labelClass}>
                              E-MAIL <span className="text-brand-primary">*</span>
                            </label>
                            <div className="flex items-center">
                              <span className="flex items-center gap-1 px-3 py-3 bg-brand-surface border border-r-0 border-brand-border rounded-l-lg font-mono text-xs text-brand-muted">
                                <Mail size={11} className="text-brand-primary" />
                              </span>
                              <input
                                {...register(`members.${index}.email` as const)}
                                type="email"
                                placeholder="member@email.com"
                                className="flex-1 bg-brand-bg border border-brand-border rounded-r-lg text-white text-sm px-3 py-3 focus:outline-none focus:border-brand-primary transition-colors font-mono placeholder-brand-muted/40"
                              />
                            </div>
                            <FieldError message={memberErrors?.email?.message} />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ================================================================ */}
            {/* STEP 3 — PAYMENT & CONFIRMATION                                   */}
            {/* ================================================================ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Payment Card */}
                <div className="bg-brand-card/90 border border-brand-primary/40 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-md space-y-6">
                  <div className="border-b border-brand-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="font-display font-black text-2xl text-white tracking-wide flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" size={24} />
                        PAYMENT & VERIFICATION
                      </h2>
                      <p className="text-xs text-brand-muted font-mono mt-1">
                        Complete the payment to confirm your registration.
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-mono text-xs text-brand-muted">REGISTRATION FEE</div>
                      <div className="font-display font-black text-3xl text-brand-primary">
                        {EVENT_CONFIG.feeDisplay}
                      </div>
                      <div className="font-mono text-[10px] text-brand-muted">PER TEAM ({selectedTeamSize} MEMBERS)</div>
                    </div>
                  </div>

                  {/* QR + Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* QR Code */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-black/60 border border-brand-border rounded-xl">
                      <div className="p-3 bg-white rounded-lg shadow-lg">
                        <img
                          src={EVENT_CONFIG.publicPaymentQrUrl}
                          alt="Official Payment QR Code"
                          className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-mono text-xs text-white font-bold tracking-wider">
                          SCAN & PAY VIA ANY UPI APP
                        </div>
                        <div className="font-mono text-[11px] text-brand-muted mt-0.5">
                          GPay · PhonePe · Paytm · BHIM
                        </div>
                        <div className="font-mono text-[10px] text-brand-orange mt-1">
                          UPI ID: {EVENT_CONFIG.upiId}
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="md:col-span-7 space-y-3 font-mono text-xs text-brand-muted">
                      <div className="font-display font-bold text-sm text-white mb-2 tracking-wider">
                        PAYMENT INSTRUCTIONS:
                      </div>
                      <ol className="space-y-2.5">
                        {[
                          'Scan the QR code with GPay, PhonePe, Paytm, or BHIM.',
                          `Pay ₹${EVENT_CONFIG.registrationFee.toLocaleString()} for the entire team.`,
                          'Save the payment screenshot from your UPI app.',
                          'Upload the screenshot below (PNG, JPG or WEBP, max 5 MB).',
                          'Enter the UPI transaction ID / UTR reference number.',
                          'Review your details and click COMPLETE REGISTRATION.',
                        ].map((txt, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/40 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-gray-300 leading-relaxed">{txt}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="pt-4 border-t border-brand-border/60">
                    <label className={labelClass}>
                      PAYMENT SCREENSHOT <span className="text-brand-primary">*</span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!screenshotPreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        className="border-2 border-dashed border-brand-border hover:border-brand-primary/80 bg-brand-bg/60 p-8 rounded-xl text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center gap-3"
                      >
                        <div className="p-3.5 rounded-full bg-brand-card group-hover:scale-110 transition-transform">
                          <Upload className="text-brand-primary" size={26} />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-white font-medium">
                            Click or drag & drop payment screenshot
                          </p>
                          <p className="font-mono text-xs text-brand-muted mt-1">
                            PNG, JPG, JPEG, or WEBP · Max 5 MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-brand-bg border border-emerald-500/50 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                            <CheckCircle2 size={16} />
                            <span>✓ PAYMENT SCREENSHOT UPLOADED</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 text-xs font-mono border border-brand-border hover:border-brand-primary text-white rounded flex items-center gap-1 transition-colors"
                            >
                              <RefreshCw size={12} /> Replace
                            </button>
                            <button
                              type="button"
                              onClick={removeScreenshot}
                              className="px-2.5 py-1 text-xs font-mono border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded flex items-center gap-1 transition-colors"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <img
                            src={screenshotPreview}
                            alt="Payment Proof Preview"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-brand-border"
                          />
                          <div className="font-mono text-xs text-brand-muted truncate">
                            <div className="text-white font-medium truncate">{screenshotFileName}</div>
                            <div className="text-[11px] text-emerald-400 mt-1">Ready for submission</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(screenshotError || errors.paymentScreenshotData) && (
                      <p className="mt-2 text-xs text-red-400 font-mono flex items-center gap-1">
                        <AlertCircle size={12} />
                        {screenshotError || errors.paymentScreenshotData?.message}
                      </p>
                    )}
                  </div>

                  {/* UPI Transaction ID */}
                  <div>
                    <label className={labelClass}>
                      UPI TRANSACTION ID <span className="text-brand-primary">*</span>
                    </label>
                    <input
                      {...register('upiTransactionId')}
                      placeholder="Enter UPI transaction ID / UTR reference"
                      className={inputClass}
                    />
                    <FieldError message={errors.upiTransactionId?.message} />
                  </div>
                </div>

                {/* Review Summary */}
                <div className="bg-brand-card/90 border border-brand-border p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-md space-y-4">
                  <div className="border-b border-brand-border/60 pb-3">
                    <h3 className="font-display font-black text-lg text-white tracking-wide flex items-center gap-2">
                      <FileText size={18} className="text-brand-primary" />
                      REGISTRATION REVIEW
                    </h3>
                    <p className="text-xs text-brand-muted font-mono mt-1">
                      Verify all details before final submission.
                    </p>
                  </div>

                  <div className="bg-brand-bg/80 p-4 rounded-lg border border-brand-border/60 space-y-3">
                    {/* Team Info */}
                    <div>
                      <span className="font-mono text-[10px] text-brand-primary tracking-widest">TEAM INFORMATION</span>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs font-mono">
                        <div>
                          <span className="text-brand-muted block">TEAM NAME:</span>
                          <span className="text-white font-bold">{watchedValues.teamName || '—'}</span>
                        </div>
                        <div>
                          <span className="text-brand-muted block">TEAM SIZE:</span>
                          <span className="text-white font-bold">{watchedValues.teamSize} Members</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-brand-border/40 pt-3">
                      <span className="font-mono text-[10px] text-brand-primary tracking-widest">TEAM LEADER</span>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs font-mono">
                        <div>
                          <span className="text-brand-muted block">NAME:</span>
                          <span className="text-white">{watchedValues.leaderName || '—'}</span>
                        </div>
                        <div>
                          <span className="text-brand-muted block">DEPT & YEAR:</span>
                          <span className="text-white">{watchedValues.leaderDepartment} · {watchedValues.leaderYear}</span>
                        </div>
                        <div>
                          <span className="text-brand-muted block">WHATSAPP:</span>
                          <span className="text-white">+91 {watchedValues.leaderWhatsapp}</span>
                        </div>
                        <div>
                          <span className="text-brand-muted block">EMAIL:</span>
                          <span className="text-white truncate">{watchedValues.leaderEmail}</span>
                        </div>
                      </div>
                    </div>

                    {watchedValues.members?.length > 0 && (
                      <div className="border-t border-brand-border/40 pt-3">
                        <span className="font-mono text-[10px] text-brand-primary tracking-widest">TEAM MEMBERS</span>
                        <div className="mt-1.5 space-y-1 text-xs font-mono">
                          {watchedValues.members.map((m, i) =>
                            m?.name ? (
                              <div key={i} className="flex items-center gap-2 text-white/80">
                                <span className="text-brand-muted">M{i + 2}:</span>
                                <span>{m.name}</span>
                                {m.department && <span className="text-brand-muted">· {m.department}</span>}
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-brand-border/40 pt-3">
                      <span className="font-mono text-[10px] text-brand-primary tracking-widest">PAYMENT</span>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs font-mono">
                        <div>
                          <span className="text-brand-muted block">AMOUNT:</span>
                          <span className="text-emerald-400 font-bold">{EVENT_CONFIG.feeDisplay}</span>
                        </div>
                        <div>
                          <span className="text-brand-muted block">SCREENSHOT:</span>
                          <span className={screenshotPreview ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                            {screenshotPreview ? '✓ Uploaded' : 'Missing'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-brand-muted block">UPI TRANSACTION ID:</span>
                          <span className="text-white font-mono">{watchedValues.upiTransactionId || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...register('confirmedCorrect')}
                        className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary mt-1 accent-brand-primary cursor-pointer"
                      />
                      <span className="font-mono text-xs text-gray-300 leading-relaxed">
                        I confirm that all information provided above is correct and our squad agrees to abide by the official rules and code of conduct of SAKTHI HACKFEST'26.
                      </span>
                    </label>
                    <FieldError message={errors.confirmedCorrect?.message} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sticky Navigation Bar */}
          <div className="sticky bottom-4 z-30 pt-4">
            <div className="bg-brand-surface/95 backdrop-blur-xl border border-brand-border p-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 max-w-3xl mx-auto">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="px-5 py-3 rounded-lg border border-brand-border hover:border-brand-muted text-white font-mono text-xs tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft size={16} /> BACK
                </button>
              ) : (
                <Link
                  to="/"
                  className="px-4 py-3 rounded-lg border border-brand-border hover:border-brand-muted text-brand-muted hover:text-white font-mono text-xs tracking-wider transition-colors"
                >
                  CANCEL
                </Link>
              )}

              <div className="font-mono text-[11px] text-brand-muted hidden sm:block">
                STEP {step} OF 3
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-bold text-xs sm:text-sm tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.3)] transition-all hover:scale-105"
                >
                  NEXT STEP <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !screenshotPreview}
                  className="px-7 py-3 rounded-lg bg-gradient-to-r from-brand-orange to-brand-primary hover:opacity-95 text-white font-display font-black text-xs sm:text-sm tracking-widest flex items-center gap-2 shadow-[0_0_25px_rgba(255,59,48,0.4)] transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> PROCESSING REGISTRATION...</>
                  ) : (
                    <>COMPLETE REGISTRATION <ArrowRight size={16} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Multi-Stage Submission Progress Overlay */}
      <AnimatePresence>
        {submitting && submissionStage > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-surface border border-brand-border/90 p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(255,59,48,0.2)] text-left relative overflow-hidden"
            >
              {/* Top ambient gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange via-brand-primary to-emerald-400" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-mono text-[10px] text-brand-primary tracking-widest uppercase">
                    SYSTEM WORKFLOW
                  </div>
                  <h3 className="font-display font-black text-xl text-white tracking-wide">
                    {submissionStage === 6 ? 'REGISTRATION CONFIRMED' : 'PROCESSING REGISTRATION...'}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-card border border-brand-border">
                  {submissionStage === 6 ? (
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  ) : (
                    <Loader2 size={24} className="text-brand-primary animate-spin" />
                  )}
                </div>
              </div>

              {/* Multi-stage Progress Steps */}
              <div className="space-y-3.5 font-mono text-xs">
                {[
                  { stepNum: 1, title: 'VERIFYING DETAILS' },
                  { stepNum: 2, title: 'UPLOADING PAYMENT' },
                  { stepNum: 3, title: 'SAVING REGISTRATION' },
                  { stepNum: 4, title: 'SENDING CONFIRMATION' },
                  { stepNum: 5, title: 'GENERATING REGISTRATION PASS' },
                ].map(({ stepNum, title }) => {
                  const isDone = submissionStage > stepNum
                  const isCurrent = submissionStage === stepNum

                  return (
                    <div
                      key={stepNum}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-brand-primary/10 border-brand-primary/40 text-white shadow-[0_0_15px_rgba(255,59,48,0.15)]'
                          : isDone
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                          : 'bg-brand-card/40 border-brand-border/50 text-brand-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          ) : isCurrent ? (
                            <Loader2 size={15} className="animate-spin text-brand-primary" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-brand-border" />
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] tracking-widest opacity-60">STEP {stepNum}</div>
                          <div className="font-bold tracking-wider">{title}</div>
                        </div>
                      </div>

                      <div className="text-[10px] uppercase font-bold tracking-widest">
                        {isDone ? 'DONE' : isCurrent ? 'IN PROGRESS' : 'WAITING'}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Confirmed Banner */}
              {submissionStage === 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-center text-xs font-bold tracking-widest"
                >
                  ✓ REGISTRATION CONFIRMED · FINALIZING PASS...
                </motion.div>
              )}

              {/* Progress bar */}
              <div className="mt-6 pt-4 border-t border-brand-border/60">
                <div className="flex justify-between font-mono text-[10px] text-brand-muted mb-1.5">
                  <span>SYSTEM PROGRESS</span>
                  <span>
                    {submissionStage === 1
                      ? '20%'
                      : submissionStage === 2
                      ? '40%'
                      : submissionStage === 3
                      ? '60%'
                      : submissionStage === 4
                      ? '80%'
                      : submissionStage === 5
                      ? '95%'
                      : '100%'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-brand-card rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-orange to-brand-primary"
                    animate={{
                      width:
                        submissionStage === 1
                          ? '20%'
                          : submissionStage === 2
                          ? '40%'
                          : submissionStage === 3
                          ? '60%'
                          : submissionStage === 4
                          ? '80%'
                          : submissionStage === 5
                          ? '95%'
                          : '100%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
