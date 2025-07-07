import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiAddressAddress extends Schema.CollectionType {
  collectionName: 'addresses';
  info: {
    displayName: 'Address';
    pluralName: 'addresses';
    singularName: 'address';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    comment: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::address.address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    flat: Attribute.String;
    house: Attribute.String & Attribute.Required;
    isDefault: Attribute.Boolean & Attribute.DefaultTo<false>;
    lat: Attribute.Decimal;
    lng: Attribute.Decimal;
    orders: Attribute.Relation<
      'api::address.address',
      'oneToMany',
      'api::order.order'
    >;
    street: Attribute.String & Attribute.Required;
    type: Attribute.Enumeration<['home', 'work', 'other']> &
      Attribute.Required &
      Attribute.DefaultTo<'other'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::address.address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::address.address',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    displayName: '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438';
    pluralName: 'categories';
    singularName: 'category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    products: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::kinza.kinza'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::category.category', 'title'> & Attribute.Required;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDeliveryConditionDeliveryCondition
  extends Schema.CollectionType {
  collectionName: 'delivery_conditions';
  info: {
    displayName: 'Delivery Condition';
    pluralName: 'delivery-conditions';
    singularName: 'delivery-condition';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::delivery-condition.delivery-condition',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    Name: Attribute.String & Attribute.Required;
    order: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::delivery-condition.delivery-condition',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDeliveryDelivery extends Schema.CollectionType {
  collectionName: 'deliveries';
  info: {
    description: '';
    displayName: '\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430';
    pluralName: 'deliveries';
    singularName: 'delivery';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::delivery.delivery',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    Description: Attribute.String;
    minOrderForFree: Attribute.Integer;
    Order: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    Slug: Attribute.String & Attribute.Required & Attribute.Unique;
    Title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::delivery.delivery',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEmailOrderEmailOrder extends Schema.SingleType {
  collectionName: 'email_orders';
  info: {
    description: '';
    displayName: '\u041F\u043E\u0447\u0442\u0430 \u0434\u043B\u044F \u0437\u0430\u043A\u0430\u0437\u0430';
    pluralName: 'email-orders';
    singularName: 'email-order';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::email-order.email-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email_order: Attribute.Email;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::email-order.email-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiIngredientOptionIngredientOption
  extends Schema.CollectionType {
  collectionName: 'ingredient_options';
  info: {
    description: '';
    displayName: 'Ingredient_option';
    pluralName: 'ingredient-options';
    singularName: 'ingredient-option';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    addPrice: Attribute.Integer & Attribute.DefaultTo<0>;
    canAdd: Attribute.Boolean & Attribute.DefaultTo<true>;
    canDouble: Attribute.Boolean & Attribute.DefaultTo<false>;
    canRemove: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::ingredient-option.ingredient-option',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    default: Attribute.Boolean & Attribute.DefaultTo<false>;
    doublePrice: Attribute.Integer & Attribute.DefaultTo<0>;
    ingredient: Attribute.Relation<
      'api::ingredient-option.ingredient-option',
      'oneToOne',
      'api::ingredient.ingredient'
    >;
    katalogs: Attribute.Relation<
      'api::ingredient-option.ingredient-option',
      'manyToMany',
      'api::kinza.kinza'
    >;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::ingredient-option.ingredient-option',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiIngredientIngredient extends Schema.CollectionType {
  collectionName: 'ingredients';
  info: {
    description: '';
    displayName: 'Ingredient';
    pluralName: 'ingredients';
    singularName: 'ingredient';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::ingredient.ingredient',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ingredient_option: Attribute.Relation<
      'api::ingredient.ingredient',
      'oneToOne',
      'api::ingredient-option.ingredient-option'
    >;
    katalogs: Attribute.Relation<
      'api::ingredient.ingredient',
      'manyToMany',
      'api::kinza.kinza'
    >;
    name: Attribute.String;
    photo: Attribute.Media<'images', true>;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::ingredient.ingredient',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiKinzaKinza extends Schema.CollectionType {
  collectionName: 'kinzas';
  info: {
    description: '';
    displayName: '\u041A\u0430\u0442\u0430\u043B\u043E\u0433';
    pluralName: 'kinzas';
    singularName: 'kinza';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    blurHash: Attribute.String & Attribute.DefaultTo<'\u2026'>;
    categories: Attribute.Relation<
      'api::kinza.kinza',
      'manyToMany',
      'api::category.category'
    >;
    category: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::kinza.kinza',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description_item: Attribute.String;
    discountPrice: Attribute.Integer;
    ImageUrl: Attribute.Media<'images'>;
    ingredient_options: Attribute.Relation<
      'api::kinza.kinza',
      'manyToMany',
      'api::ingredient-option.ingredient-option'
    >;
    ingredients: Attribute.Relation<
      'api::kinza.kinza',
      'manyToMany',
      'api::ingredient.ingredient'
    >;
    isWeightBased: Attribute.Boolean & Attribute.DefaultTo<false>;
    mark: Attribute.String;
    minimumWeight: Attribute.Decimal;
    name_item: Attribute.String;
    order_items: Attribute.Relation<
      'api::kinza.kinza',
      'oneToMany',
      'api::order-item.order-item'
    >;
    price: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    tags: Attribute.Relation<'api::kinza.kinza', 'manyToMany', 'api::tag.tag'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::kinza.kinza',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    weight: Attribute.Decimal;
  };
}

export interface ApiOrderItemOrderItem extends Schema.CollectionType {
  collectionName: 'order_items';
  info: {
    description: '';
    displayName: 'OrderItem';
    pluralName: 'order-items';
    singularName: 'order-item';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order-item.order-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    kinzas: Attribute.Relation<
      'api::order-item.order-item',
      'manyToOne',
      'api::kinza.kinza'
    >;
    order: Attribute.Relation<
      'api::order-item.order-item',
      'manyToOne',
      'api::order.order'
    >;
    price: Attribute.Integer & Attribute.Required;
    publishedAt: Attribute.DateTime;
    qty: Attribute.Integer & Attribute.DefaultTo<1>;
    titleCached: Attribute.String;
    total: Attribute.Integer & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::order-item.order-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    weight: Attribute.Decimal;
  };
}

export interface ApiOrderOrder extends Schema.CollectionType {
  collectionName: 'orders';
  info: {
    description: '';
    displayName: '\u0417\u0430\u043A\u0430\u0437\u044B';
    pluralName: 'orders';
    singularName: 'order';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    address: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'api::address.address'
    >;
    comment: Attribute.Text;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    delivery: Attribute.Enumeration<['courier', 'pickup']>;
    details: Attribute.Text;
    items: Attribute.Relation<
      'api::order.order',
      'oneToMany',
      'api::order-item.order-item'
    >;
    order_date: Attribute.DateTime;
    orderNumber: Attribute.Integer;
    payment: Attribute.Enumeration<['card', 'cash', 'sbp']>;
    payment_method: Attribute.String;
    payStatus: Attribute.Enumeration<['unpaid', 'paid', 'refunded']> &
      Attribute.DefaultTo<'unpaid'>;
    phone: Attribute.String;
    publishedAt: Attribute.DateTime;
    shipping_address: Attribute.String;
    status: Attribute.Enumeration<['new', 'cooking', 'on_way', 'done']> &
      Attribute.DefaultTo<'new'>;
    total_price: Attribute.Integer;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiOtpCodeOtpCode extends Schema.CollectionType {
  collectionName: 'otp_codes';
  info: {
    displayName: 'OTP Code';
    pluralName: 'otp-codes';
    singularName: 'otp-code';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::otp-code.otp-code',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    expires: Attribute.DateTime;
    phone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::otp-code.otp-code',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    used: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface ApiTagTag extends Schema.CollectionType {
  collectionName: 'tags';
  info: {
    description: '';
    displayName: 'Tag';
    pluralName: 'tags';
    singularName: 'tag';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    kinzas: Attribute.Relation<
      'api::tag.tag',
      'manyToMany',
      'api::kinza.kinza'
    >;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiTestTest extends Schema.CollectionType {
  collectionName: 'tests';
  info: {
    displayName: 'test';
    pluralName: 'tests';
    singularName: 'test';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::test.test', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    test: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::test.test', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    blurhash: Attribute.Text;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'users';
  info: {
    displayName: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    addresses: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::address.address'
    >;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        maxLength: 254;
        minLength: 6;
      }>;
    orders: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::order.order'
    >;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    phone: Attribute.String & Attribute.Unique;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::address.address': ApiAddressAddress;
      'api::category.category': ApiCategoryCategory;
      'api::delivery-condition.delivery-condition': ApiDeliveryConditionDeliveryCondition;
      'api::delivery.delivery': ApiDeliveryDelivery;
      'api::email-order.email-order': ApiEmailOrderEmailOrder;
      'api::ingredient-option.ingredient-option': ApiIngredientOptionIngredientOption;
      'api::ingredient.ingredient': ApiIngredientIngredient;
      'api::kinza.kinza': ApiKinzaKinza;
      'api::order-item.order-item': ApiOrderItemOrderItem;
      'api::order.order': ApiOrderOrder;
      'api::otp-code.otp-code': ApiOtpCodeOtpCode;
      'api::tag.tag': ApiTagTag;
      'api::test.test': ApiTestTest;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
