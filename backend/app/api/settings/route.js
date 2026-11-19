import { route, readForm } from '@/lib/http'
import { getSettingRows, getSettingsMap } from '@/lib/settings'
import { updateSettings } from '@/lib/services/settings'

// GET is public: the landing and login pages show the system name before sign-in.
export const { GET, PUT, OPTIONS } = route({
    GET: async () => ({ settings: await getSettingsMap(), rows: await getSettingRows() }),
    PUT: async ({ request }) => updateSettings(await readForm(request)),
})
