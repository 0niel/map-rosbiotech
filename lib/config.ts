import { Campus } from './campuses'
import { DataSourceType } from './schedule/data-source-factory'

export interface Config {
  campuses: Campus[]
  svgMaps: { [key: string]: string }
  schedule: {
    defaultDataSource: DataSourceType
  }
}

const config: Config = {
  campuses: [
    {
      shortName: 'Сокол',
      description: 'Волоколамское шоссе, 11',
      floors: [1],
      initialFloor: 1,
      initialScale: 0.2,
      initialPositionX: 600,
      initialPositionY: 0
    }
  ],
  svgMaps: {
    Floor1: '/svg-maps/floor_1.svg'
  },

  schedule: {
    defaultDataSource: 'rosbiotech'
  }
}

export default config
