import { route } from '@/lib/http'
import { removeStudentFromGroup } from '@/lib/services/groups'

export const { DELETE, OPTIONS } = route({
    DELETE: async ({ params }) => removeStudentFromGroup(params.id, params.studentId),
})
