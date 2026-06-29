/** Strip whitespace and keep digits only for TOTP codes. */
export function normalizeTotpCode(value: string) {
  return value.replace(/\D/g, '').slice(0, 6)
}

export function isValidTotpCode(value: string) {
  return /^\d{6}$/.test(normalizeTotpCode(value))
}

export function buildTwoFactorQrUrl(otpauthUrl: string, size = 200) {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: otpauthUrl,
    margin: '0',
  })

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
}
