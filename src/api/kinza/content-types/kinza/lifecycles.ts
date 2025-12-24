import { errors } from '@strapi/utils';

const { ValidationError } = errors;

const normalizeIds = (value: unknown) => {
  if (value == null) return [];
  const list = Array.isArray(value) ? value : [value];

  return list
    .map((item) => {
      if (item == null) return null;
      if (typeof item === 'number') return item;
      if (typeof item === 'string') return Number.parseInt(item, 10);
      if (typeof item === 'object' && 'id' in (item as Record<string, unknown>)) {
        const id = (item as Record<string, unknown>).id;
        if (typeof id === 'number') return id;
        if (typeof id === 'string') return Number.parseInt(id, 10);
      }
      return null;
    })
    .filter((id) => Number.isFinite(id)) as number[];
};

const resolveNextCategoryIds = (
  existingIds: number[],
  relationInput: unknown,
) => {
  if (relationInput == null) {
    return existingIds;
  }

  if (Array.isArray(relationInput)) {
    return normalizeIds(relationInput);
  }

  if (typeof relationInput === 'object') {
    const input = relationInput as Record<string, unknown>;

    if (input.set) {
      return normalizeIds(input.set);
    }

    let next = new Set(existingIds);

    if (input.connect) {
      normalizeIds(input.connect).forEach((id) => next.add(id));
    }

    if (input.disconnect) {
      normalizeIds(input.disconnect).forEach((id) => next.delete(id));
    }

    return Array.from(next);
  }

  return existingIds;
};

const ensureSingleCategory = (categoryIds: number[]) => {
  if (categoryIds.length !== 1) {
    throw new ValidationError('exactly_one_category_required');
  }
};

const fetchExistingCategoryIds = async (id: number) => {
  const entity = await strapi.db.query('api::kinza.kinza').findOne({
    where: { id },
    populate: {
      categories: {
        select: ['id'],
      },
    },
  });

  if (!entity || !Array.isArray(entity.categories)) {
    return [];
  }

  return entity.categories.map((category: { id: number }) => category.id);
};

export default {
  async beforeCreate(event) {
    const data = event.params?.data ?? {};
    const categoryIds = resolveNextCategoryIds([], data.categories);
    ensureSingleCategory(categoryIds);
  },

  async beforeUpdate(event) {
    const data = event.params?.data ?? {};
    const id = Number(event.params?.where?.id);

    if (!Number.isFinite(id)) {
      if (data.categories !== undefined) {
        const categoryIds = resolveNextCategoryIds([], data.categories);
        ensureSingleCategory(categoryIds);
      }
      return;
    }

    const existingIds = await fetchExistingCategoryIds(id);
    const categoryIds = resolveNextCategoryIds(existingIds, data.categories);
    ensureSingleCategory(categoryIds);
  },
};
