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
      floors: [],
      initialFloor: 2,
      initialScale: 1,
      svgMaps: {},
      buildings: [
        {
          name: "A",
          floors: [2, 3, 4, 5],
          svgMaps: {
            "2": "/svg-maps/corpus_a/corpus_a_2/corpus_a_2_floor.svg",
            "3": "/svg-maps/corpus_a/corpus_a_3/corpus_a_3_floor.svg",
            "4": "/svg-maps/corpus_a/corpus_a_4/corpus_a_4_floor.svg",
            "5": "/svg-maps/corpus_a/corpus_a_5/corpus_a_5_floor.svg",
          },
          isInitial: true,
        },
        {
          name: "Б",
          floors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          svgMaps: {
            "2": "/svg-maps/corpus_b/corpus_b_2/corpus_b_2_floor.svg",
            "3": "/svg-maps/corpus_b/corpus_b_3/corpus_b_3_floor_uncodified.svg",
            "4": "/svg-maps/corpus_b/corpus_b_4/corpus_b_4_floor.svg",
            "5": "/svg-maps/corpus_b/corpus_b_5/corpus_b_5_floor.svg",
            "6": "/svg-maps/corpus_b/corpus_b_6/corpus_b_6_floor.svg",
            "7": "/svg-maps/corpus_b/corpus_b_7/corpus_b_7_floor_uncodified.svg",
            "8": "/svg-maps/corpus_b/corpus_b_8/corpus_b_8_floor.svg",
            "9": "/svg-maps/corpus_b/corpus_b_9/corpus_b_9_floor.svg",
            "10": "/svg-maps/corpus_b/corpus_b_10/corpus_b_10_floor.svg",
            "11": "/svg-maps/corpus_b/corpus_b_11/corpus_b_11_floor.svg",
          }
        },
        {
          name: "В",
          floors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          svgMaps: {
            "2": "/svg-maps/corpus_v_and_business_center/corpus_v_2/Group 1.svg",
            "3": "/svg-maps/corpus_v_and_business_center/corpus_v_3/Group 1.svg",
            "4": "/svg-maps/corpus_v_and_business_center/corpus_v_4/Group 1.svg",
            "5": "/svg-maps/corpus_v_and_business_center/corpus_v_5/Group 1.svg",
            "6": "/svg-maps/corpus_v_and_business_center/corpus_v_6/Group 1.svg",
            "7": "/svg-maps/corpus_v_and_business_center/corpus_v_7/Group 1.svg",
            "8": "/svg-maps/corpus_v_and_business_center/corpus_v_8/Group 1.svg",
            "9": "/svg-maps/corpus_v_and_business_center/corpus_v_9/Group 1.svg",
            "10": "/svg-maps/corpus_v_and_business_center/corpus_v_10/Group 1.svg",
            "11": "/svg-maps/corpus_v_and_business_center/corpus_v_11/Group 1.svg",
          }
        },
        {
          name: "БЦ",
          floors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          svgMaps: {
            "2": "/svg-maps/corpus_v_and_business_center/corpus_v_2/Group 1.svg",
            "3": "/svg-maps/corpus_v_and_business_center/corpus_v_3/Group 1.svg",
            "4": "/svg-maps/corpus_v_and_business_center/corpus_v_4/Group 1.svg",
            "5": "/svg-maps/corpus_v_and_business_center/corpus_v_5/Group 1.svg",
            "6": "/svg-maps/corpus_v_and_business_center/corpus_v_6/Group 1.svg",
            "7": "/svg-maps/corpus_v_and_business_center/corpus_v_7/Group 1.svg",
            "8": "/svg-maps/corpus_v_and_business_center/corpus_v_8/Group 1.svg",
            "9": "/svg-maps/corpus_v_and_business_center/corpus_v_9/Group 1.svg",
            "10": "/svg-maps/corpus_v_and_business_center/corpus_v_10/Group 1.svg",
            "11": "/svg-maps/corpus_v_and_business_center/corpus_v_11/Group 1.svg",
          }
        }
      ]
    }
  ],

  schedule: {
    defaultDataSource: 'rosbiotech'
  }
}

export default config
