// Where each text appears and how long it may be. Used by the checks.
export const meta: Record<string, { where: string; max: number }> = {
  'signin.title': { where: 'Header of the sign-in screen', max: 20 },
  'signin.button': { where: 'Main button', max: 16 },
  'signin.forgot': { where: 'Link under the button', max: 24 },
};
