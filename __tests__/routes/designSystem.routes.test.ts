import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';

beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
});

afterEach(async () => {
  await mongoose.connection.close();
});

async function setupIds() {
  const userData = {
    name: 'Test',
    email: `test.${Math.random().toString(36).slice(2)}@test.com`,
    password: 'password',
  };
  const userResponse = await request(app).post('/api/users').send(userData);
  const { _id: userId, token: authToken } = userResponse.body;

  const fontsData = {
    headingFontName: 'Inter',
    parragraphFontName: 'Inter',
    baseSize: 80,
    scaleFactor: 'Major Third (1.250)',
  };
  const fontsResponse = await request(app)
    .post(`/api/fonts/`)
    .send(fontsData)
    .set({ Authorization: `Bearer ${authToken}` });
  const { _id: fontsId } = fontsResponse.body.data;

  const paletteData = {
    primaryColors: [{ hexCode: '#FFFFFF' }, { hexCode: '#000000' }],
    secondaryColors: [],
    textColors: [],
    backgroundColors: [],
    extraColors: [],
  };
  const paletteResponse = await request(app)
    .post(`/api/palette/`)
    .send(paletteData)
    .set({ Authorization: `Bearer ${authToken}` });
  const { _id: paletteId } = paletteResponse.body;

  const spacingsData = {
    baseSize: 80,
    scaleFactor: 'Major Third (1.250)',
  };
  const spacingsResponse = await request(app)
    .post(`/api/spacings/`)
    .send(spacingsData)
    .set({ Authorization: `Bearer ${authToken}` });
  const { _id: spacingsId } = spacingsResponse.body.data;

  return {
    userId,
    fontsId,
    paletteId,
    spacingsId,
    authToken,
  };
}

describe('Testing the design system routes module', () => {
  test('Calling create design system route with correct body should return created message and design system', async () => {
    const { userId, fontsId, paletteId, spacingsId, authToken } =
      await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: userId,
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const response = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });

    expect(response.body.message).toBe('Design system created successfully');
    expect(response.body.data).toHaveProperty('name', designSystemData.name);
    expect(response.body.data).toHaveProperty(
      'userId',
      designSystemData.userId
    );
    expect(response.body.data).toHaveProperty(
      'paletteId',
      designSystemData.paletteId
    );
    expect(response.body.data).toHaveProperty(
      'fontsId',
      designSystemData.fontsId
    );
    expect(response.body.data).toHaveProperty(
      'spacingsId',
      designSystemData.spacingsId
    );
    const { _id: id } = response.body.data;
    await request(app)
      .delete(`/api/design-system/${id}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });
  });

  test('Calling create design system route with incorrect body should return an error message', async () => {
    const { paletteId, fontsId, spacingsId, authToken } = await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: '000000000000000000000000',
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const response = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });

    expect(response.body.message).toBe(
      'DesignSystem validation failed: userId: Invalid ID(s)'
    );
    expect(response.statusCode).toBe(400);
  });

  test('Calling delete design system route with correct params should return deleted design systems count', async () => {
    const { userId, fontsId, paletteId, spacingsId, authToken } =
      await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: userId,
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const response = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });
    const { _id: id } = response.body.data;

    const res = await request(app)
      .delete(`/api/design-system/${id}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });
    expect(res.body.message).toBe('Design system deleted successfully');
    expect(res.body.data).toHaveProperty('deletedCount', 1);
  });

  test('Calling delete design system route with incorrect id syntax should return an error message', async () => {
    const { userId, fontsId, paletteId, spacingsId, authToken } =
      await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: userId,
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const response = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });
    const { _id: id } = response.body.data;

    const res = await request(app)
      .delete(`/api/design-system/${0}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });
    expect(res.body.message).toBe(
      'Invalid design system id syntax or design system not found'
    );
    expect(res.statusCode).toBe(400);
  });

  test('Calling get design system by id route with correct params should return design system', async () => {
    const { userId, fontsId, paletteId, spacingsId, authToken } =
      await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: userId,
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const response = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });
    const { _id: id } = response.body.data;

    const res = await request(app)
      .get(`/api/design-system/${id}`)
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });

    expect(res.body.data).toHaveProperty('name', 'Test 1');
    expect(res.body.data).toHaveProperty('userId', userId);
    expect(res.body.data).toHaveProperty('paletteId', paletteId);
    expect(res.body.data).toHaveProperty('fontsId', fontsId);
    expect(res.body.data).toHaveProperty('spacingsId', spacingsId);

    await request(app)
      .delete(`/api/design-system/${id}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });
  });

  test('Calling get design systems route with correct params should return design systems', async () => {
    const { userId, fontsId, paletteId, spacingsId, authToken } =
      await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: userId,
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const response = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });
    const { _id: id } = response.body.data;

    const res = await request(app)
      .get(`/api/design-system/users/${userId}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });

    const designSystems: object[] = res.body.data;
    expect(designSystems.length).toBeGreaterThan(0);

    await request(app)
      .delete(`/api/design-system/${id}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });
  });

  test('Calling update design system route with correct params and body should return updated message and new design system', async () => {
    const { userId, fontsId, paletteId, spacingsId, authToken } =
      await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: userId,
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const createdDesignSystemResponse = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });
    const { _id: id } = createdDesignSystemResponse.body.data;

    const updatedDesignSystemData = {
      name: 'Test 2',
    };
    const response = await request(app)
      .put(`/api/design-system/${id}`)
      .send(updatedDesignSystemData)
      .set({ Authorization: `Bearer ${authToken}` });

    expect(response.body.message).toBe('Design system updated successfully');
    expect(response.body.data).toHaveProperty(
      'name',
      updatedDesignSystemData.name
    );
    await request(app)
      .delete(`/api/design-system/${id}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });
  });

  test('Calling update design system route with incorrect id should return an error message', async () => {
    const { userId, fontsId, paletteId, spacingsId, authToken } =
      await setupIds();

    const designSystemData = {
      name: 'Test 1',
      userId: userId,
      paletteId: paletteId,
      fontsId: fontsId,
      spacingsId: spacingsId,
    };
    const createdDesignSystemResponse = await request(app)
      .post('/api/design-system')
      .send(designSystemData)
      .set({ Authorization: `Bearer ${authToken}` });
    const { _id: id } = createdDesignSystemResponse.body.data;

    const updatedDesignSystemData = {
      name: '',
    };
    const response = await request(app)
      .put(`/api/design-system/${'000000000000000000000000'}`)
      .send(updatedDesignSystemData)
      .set({ Authorization: `Bearer ${authToken}` });

    expect(response.body.message).toBe('Design system not found');
    expect(response.statusCode).toBe(404);
    await request(app)
      .delete(`/api/design-system/${id}`)
      .send()
      .set({ Authorization: `Bearer ${authToken}` });
  });
});
