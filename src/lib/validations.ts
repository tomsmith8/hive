import { z } from 'zod'

// User validations
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'PM', 'DEVELOPER', 'DESIGNER', 'QA']).default('PM'),
})

export const updateUserSchema = createUserSchema.partial()

// Project validations
export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).default('ACTIVE'),
})

export const updateProjectSchema = createProjectSchema.partial()

// Task validations
export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  estimatedHours: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

// Bounty validations
export const createBountySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('OPEN'),
  deadline: z.string().datetime().optional(),
})

export const updateBountySchema = createBountySchema.partial()

// Bounty submission validations
export const createBountySubmissionSchema = z.object({
  description: z.string().min(1),
})

export const updateBountySubmissionSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
})

// Roadmap item validations
export const createRoadmapItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  targetDate: z.string().datetime().optional(),
})

export const updateRoadmapItemSchema = createRoadmapItemSchema.partial()

// Comment validations
export const createCommentSchema = z.object({
  content: z.string().min(1),
  taskId: z.string().optional(),
})

export const updateCommentSchema = z.object({
  content: z.string().min(1),
}) 