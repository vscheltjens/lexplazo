'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function loginAction(_prev: { error?: string }, formData: FormData) {
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirectTo: '/admin/tramites',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Credenciales incorrectas. Verifica el usuario y la contraseña.' }
    }
    throw error // re-throw NEXT_REDIRECT so the redirect actually happens
  }
  return {}
}
