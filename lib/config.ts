import { Campus } from './campuses'
import { DataSourceType } from './schedule/data-source-factory'

export interface Config {
  campuses: Campus[]
  schedule: {
    defaultDataSource: DataSourceType
  }
}

const config: Config = {
  campuses: [
    {
      shortName: "Сокол",
      description: "Волоколамское шоссе, 11",
      floors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      initialFloor: 2,
      initialScale: 1,
      svgMaps: {
        "1": "/svg-maps/1.svg",
        "2": "/svg-maps/2.svg",
        "3": "/svg-maps/3.svg",
        "4": "/svg-maps/4.svg",
        "5": "/svg-maps/5.svg",
        "6": "/svg-maps/6.svg",
        "7": "/svg-maps/7.svg",
        "8": "/svg-maps/8.svg",
        "9": "/svg-maps/9.svg",
        "10": "/svg-maps/10.svg",
        "11": "/svg-maps/11.svg",
        "12": "/svg-maps/12.svg",
      },
    }
  ],

  schedule: {
    defaultDataSource: 'rosbiotech'
  }
}

export default config
