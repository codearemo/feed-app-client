import axios from 'axios'
import { getHealthUrl } from './config'
import type { HealthStatus } from './types'

export const healthApi = {
  check() {
    return axios
      .get<HealthStatus>(getHealthUrl(), { timeout: 5_000 })
      .then((response) => response.data)
  },
}
