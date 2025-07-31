import type { Attribute, Schema } from '@strapi/strapi';

export interface NutritionNutrition extends Schema.Component {
  collectionName: 'components_nutrition_nutritions';
  info: {
    displayName: 'nutrition';
  };
  attributes: {
    carb_100: Attribute.Decimal;
    carb_total: Attribute.Decimal;
    fat_100: Attribute.Decimal;
    fat_total: Attribute.Decimal;
    ingredients_text: Attribute.String;
    kcal_100: Attribute.Decimal;
    kcal_total: Attribute.Decimal;
    protein_100: Attribute.Decimal;
    protein_total: Attribute.Decimal;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'nutrition.nutrition': NutritionNutrition;
    }
  }
}
