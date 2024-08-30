import axios from 'axios'

export interface StrapiResponse {
  data: {
    id: number
    attributes: {
      firstName: string
      lastName: string
      patronymic?: string
      photo?: {
        data: {
          id: number
          attributes: {
            url: string
          }
        }
      }
      positions: {
        department: string
        post: string
        contacts: {
          phone?: string
          IP?: string
          email?: string
          receptionTime?: string
          room?: {
            data: {
              attributes: {
                name: string
                campus: string
              }
            }
          }
        }[]
      }[]
    }
  }[]
}

const API_URL = 'https://cms.mirea.ninja'

export const searchEmployees = async (query: string) => {
  const data = await axios.get<StrapiResponse>(
    `${API_URL}/api/employees?_q=${query}&populate[0]=positions&populate[1]=positions.contacts&populate[2]=photo&populate[3]=positions.contacts.room`
  )

  return data.data
}

export const searchEmployeesByRoom = async (room: string, campus: string) => {
  const data = await axios.get<StrapiResponse>(
    `${API_URL}/api/employees?populate[0]=positions&populate[1]=positions.contacts&populate[2]=photo&populate[3]=positions.contacts.room&filters[positions][contacts][room][name]=${room}&filters[positions][contacts][room][campus]=${campus}`
  )

  return data.data
}
