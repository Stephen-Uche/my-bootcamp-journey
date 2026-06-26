import { z } from 'zod'

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.string().min(1, 'Category required'),
  price: z.number().positive('Price must be positive'),
  condition: z.enum(['new', 'like-new', 'good', 'fair']),
  imageUrl: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  imageUrls: z.array(z.string().url('Image must be a valid URL')).max(8).optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>

export const updateListingSchema = createListingSchema.extend({
  status: z.enum(['available', 'sold', 'removed']),
})

export type UpdateListingInput = z.infer<typeof updateListingSchema>

export interface Listing {
  id: string
  seller_id: string
  title: string
  description: string
  category: string
  price: number
  condition: string
  status: 'available' | 'sold' | 'removed'
  photos: string[]
  seller: {
    id: string
    email?: string
    full_name: string
    university: string
  }
  created_at: string
  updated_at: string
}

const swedishUniversityDomains = [
  'uu.se',
  'lu.se',
  'gu.se',
  'su.se',
  'umu.se',
  'liu.se',
  'ki.se',
  'kth.se',
  'chalmers.se',
  'ltu.se',
  'slu.se',
  'oru.se',
  'kau.se',
  'lnu.se',
  'miun.se',
  'mau.se',
  'mdu.se',
  'sh.se',
  'hb.se',
  'hig.se',
  'hh.se',
  'his.se',
  'hv.se',
  'hkr.se',
  'bth.se',
  'du.se',
  'gih.se',
  'kmh.se',
  'uniarts.se',
  'fhs.se',
  'hhs.se',
]

const swedishYhDomains = [
  'yrgo.se',
  'iths.se',
  'it-hogskolan.se',
  'nackademin.se',
  'medieinstitutet.se',
  'hyperisland.com',
  'changemakereducations.se',
  'jensenyh.se',
  'tucsweden.se',
  'teknikhogskolan.se',
  'plushogskolan.se',
  'kyh.se',
  'ecutbildning.se',
  'newton.se',
  'hermods.se',
  'folkuniversitetet.se',
  'fei.se',
  'ihm.se',
  'berghs.se',
  'campusnykoping.se',
  'yrkeshogskolan.se',
  'gafe.molndal.se',
]

const allowedEmailDomains = [
  'gmail.com',
  'gmail.se',
  'googlemail.com',
  ...swedishUniversityDomains,
  ...swedishYhDomains,
]

export const studentEmailSchema = z.string().email('Invalid email').refine(
  (email) => {
    const domain = email.split('@')[1]?.toLowerCase() || ''
    return allowedEmailDomains.some((allowedDomain) => domain.endsWith(allowedDomain))
  },
  'Use gmail.com or an approved student email address'
)

export const signupSchema = z.object({
  email: studentEmailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name required'),
})

export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: studentEmailSchema,
  password: z.string().min(1, 'Password required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, 'Choose a rating').max(5, 'Choose a rating'),
  category: z.enum(['bug', 'idea', 'marketplace', 'account', 'other']),
  message: z.string().min(10, 'Feedback must be at least 10 characters').max(1500),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>

export interface User {
  id: string
  email: string
  full_name: string
  university: string
  verified_student: boolean
  role: 'student' | 'admin'
  created_at: string
}

export interface UserFeedback {
  id: string
  user_id: string
  rating: number
  category: 'bug' | 'idea' | 'marketplace' | 'account' | 'other'
  message: string
  status: 'new' | 'reviewed' | 'resolved'
  created_at: string
  updated_at: string
}
