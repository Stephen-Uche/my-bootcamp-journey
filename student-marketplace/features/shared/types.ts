import { z } from 'zod'

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.string().min(1, 'Category required'),
  price: z.number().positive('Price must be positive'),
  condition: z.enum(['new', 'like-new', 'good', 'fair']),
})

export type CreateListingInput = z.infer<typeof createListingSchema>

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
    full_name: string
    university: string
  }
  created_at: string
  updated_at: string
}

export const signupSchema = z.object({
  email: z.string().email('Invalid email').refine(
    (email) => {
      const domain = email.split('@')[1]?.toLowerCase() || ''
      const validDomains = ['gu.se', 'lnu.se', 'kth.se', 'umeå.se', 'su.se', 'miun.se']
      return validDomains.some((d) => domain.endsWith(d))
    },
    'Only Swedish university emails are allowed for now'
  ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name required'),
})

export type SignupInput = z.infer<typeof signupSchema>

export interface User {
  id: string
  email: string
  full_name: string
  university: string
  verified_student: boolean
  created_at: string
}
