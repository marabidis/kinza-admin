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

const resolveRelationId = (input: unknown, existingId: number | null) => {
  if (input === undefined) return existingId;
  if (input === null) return null;

  if (typeof input === 'number') return input;

  if (typeof input === 'string') {
    const parsed = Number.parseInt(input, 10);
    return Number.isFinite(parsed) ? parsed : existingId;
  }

  if (Array.isArray(input)) {
    return normalizeIds(input)[0] ?? null;
  }

  if (typeof input === 'object') {
    const value = input as Record<string, unknown>;

    if ('set' in value) {
      return normalizeIds(value.set)[0] ?? null;
    }

    if ('connect' in value) {
      return normalizeIds(value.connect)[0] ?? null;
    }

    if ('disconnect' in value) {
      return null;
    }

    if ('id' in value) {
      return normalizeIds(value)[0] ?? null;
    }
  }

  return existingId;
};

const ensureUniqueNameGroup = async (
  name: string | undefined,
  group: string | undefined,
  ignoreId?: number,
) => {
  if (!name || !group) return;

  const where: Record<string, unknown> = { name, group };
  if (Number.isFinite(ignoreId)) {
    where.id = { $ne: ignoreId };
  }

  const existing = await strapi.db.query('api::tag.tag').findOne({
    where,
    select: ['id'],
  });

  if (existing) {
    throw new ValidationError('tag_name_group_unique');
  }
};

const ensureActiveTagEmoji = async (tagEmojiId: number | null) => {
  if (!Number.isFinite(tagEmojiId)) return;

  const activeEmoji = await strapi.db.query('api::tag-emoji.tag-emoji').findOne({
    where: { id: tagEmojiId, is_active: true },
    select: ['id'],
  });

  if (!activeEmoji) {
    throw new ValidationError('tag_emoji_inactive');
  }
};

const fetchExistingTag = async (id: number) => {
  const entity = await strapi.db.query('api::tag.tag').findOne({
    where: { id },
    select: ['name', 'group'],
    populate: {
      tagEmoji: {
        select: ['id'],
      },
    },
  });

  return {
    name: entity?.name as string | undefined,
    group: entity?.group as string | undefined,
    tagEmojiId: entity?.tagEmoji?.id ?? null,
  };
};

export default {
  async beforeCreate(event) {
    const data = event.params?.data ?? {};

    await ensureUniqueNameGroup(data.name, data.group);

    if (Object.prototype.hasOwnProperty.call(data, 'tagEmoji')) {
      const tagEmojiId = resolveRelationId(data.tagEmoji, null);
      await ensureActiveTagEmoji(tagEmojiId);
    }
  },

  async beforeUpdate(event) {
    const data = event.params?.data ?? {};
    const id = Number(event.params?.where?.id);

    if (!Number.isFinite(id)) {
      await ensureUniqueNameGroup(data.name, data.group);
      return;
    }

    const existing = await fetchExistingTag(id);
    const name = data.name ?? existing.name;
    const group = data.group ?? existing.group;

    await ensureUniqueNameGroup(name, group, id);

    if (Object.prototype.hasOwnProperty.call(data, 'tagEmoji')) {
      const tagEmojiId = resolveRelationId(data.tagEmoji, existing.tagEmojiId);
      await ensureActiveTagEmoji(tagEmojiId);
    }
  },
};
