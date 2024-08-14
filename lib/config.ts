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
      floors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      initialFloor: 1,
      initialScale: 0.2,
    }
  ],

  svgMaps: {
    Floor1: '/svg-maps/corpus_b_2.svg',
    Floor2: '/svg-maps/corpus_b_3_floor_uncodified.svg',
    Floor3: '/svg-maps/corpus_b_4_floor.svg',
    Floor4: '/svg-maps/corpus_b_5_floor.svg',
    Floor5: '/svg-maps/corpus_b_6_floor.svg',
    Floor6: '/svg-maps/corpus_b_7_floor_uncodified.svg',
    Floor7: '/svg-maps/corpus_b_8_floor.svg',
    Floor8: '/svg-maps/corpus_b_9_floor.svg',
    Floor9: '/svg-maps/corpus_b_10_floor.svg',
    Floor10: '/svg-maps/corpus_b_11_floor.svg',
  },

  schedule: {
    defaultDataSource: 'rosbiotech'
  }
}

export default config
