import { publicConfig } from '../config/public-config.js';
import { getJson, postJson } from '../utils/http.js';
import {
  mapActionDefinition,
  mapActionRunResult,
  mapCompanyHealth,
  mapDashboardSummary,
  mapFinanceAdjustment,
  mapList,
  mapNpsDashboard,
  mapProductNewsItem,
  mapResearchItem,
  mapSupportDashboard,
  mapSupportTicket,
} from '../mappers/dashboard.mapper.js';
import {
  actionsMockResponse,
  companyHealthMockResponse,
  financeAdjustmentsMockResponse,
  npsDashboardMockResponse,
  productNewsMockResponse,
  runMockAction,
  supportDashboardMockResponse,
} from './mock-data/dashboard.mock.js';

// Frontend pages should call these service functions instead of
// attempting to talk directly to a privileged database.
// This file is the frontend boundary for future dashboard API paths.
// Supabase details and future core Postgres details must stay behind
// the API boundary and adapter layer, not inside frontend pages.
// In local mode, finance adjustments are served from a mock module.
// When the future API layer is ready, this local mock path should be
// replaced by the API request path below.

const isLocalMockMode = publicConfig.appEnv === 'local';

const requestList = async (path, mapper) => {
  const payload = await getJson(path);

  if (Array.isArray(payload)) {
    return mapList(payload, mapper);
  }

  if (payload && Array.isArray(payload.items)) {
    return mapList(payload.items, mapper);
  }

  throw new Error(`Unexpected response shape from ${path}.`);
};

const buildQueryPath = (path, query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export const getDashboardSummary = async () => {
  const payload = await getJson('/dashboard/summary');

  if (!payload || typeof payload !== 'object') {
    throw new Error('Unexpected response shape from /dashboard/summary.');
  }

  return mapDashboardSummary(payload);
};

export const getSupportTickets = async () =>
  requestList('/dashboard/support-tickets', mapSupportTicket);

export const getSupportDashboard = async (query = {}) => {
  if (isLocalMockMode) {
    return mapSupportDashboard(supportDashboardMockResponse);
  }

  const payload = await getJson(buildQueryPath('/support-tickets', query));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Unexpected response shape from /support-tickets.');
  }

  return mapSupportDashboard(payload);
};

export const getFinanceAdjustments = async () => {
  if (isLocalMockMode) {
    return mapList(financeAdjustmentsMockResponse.items, mapFinanceAdjustment);
  }

  return requestList('/finance-adjustments', mapFinanceAdjustment);
};

export const getCompanyHealth = async () => {
  if (isLocalMockMode) {
    return mapList(companyHealthMockResponse.items, mapCompanyHealth);
  }

  return requestList('/company-health', mapCompanyHealth);
};

export const getProductNews = async () => {
  if (isLocalMockMode) {
    return mapList(productNewsMockResponse.items, mapProductNewsItem);
  }

  return requestList('/product-news', mapProductNewsItem);
};

export const getNpsDashboard = async (query = {}) => {
  if (isLocalMockMode) {
    return mapNpsDashboard(npsDashboardMockResponse);
  }

  const payload = await getJson(buildQueryPath('/nps', query));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Unexpected response shape from /nps.');
  }

  return mapNpsDashboard(payload);
};

export const getAvailableActions = async () => {
  if (isLocalMockMode) {
    return mapList(actionsMockResponse.items, mapActionDefinition);
  }

  return requestList('/actions', mapActionDefinition);
};

export const triggerAction = async (actionId, payload = {}) => {
  if (isLocalMockMode) {
    return mapActionRunResult(runMockAction(actionId, payload));
  }

  const response = await postJson('/actions', {
    actionId,
    mode: payload.mode || 'dry_run',
    input: payload.input || {},
  });

  return mapActionRunResult(response);
};

export const submitFeedback = async (payload = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('A feedback payload is required.');
  }

  const response = await postJson('/feedback', payload);

  if (!response || typeof response !== 'object') {
    throw new Error('Unexpected response shape from /feedback.');
  }

  return response;
};

export const getResearchData = async () => requestList('/dashboard/research', mapResearchItem);

export default {
  getDashboardSummary,
  getSupportTickets,
  getSupportDashboard,
  getFinanceAdjustments,
  getCompanyHealth,
  getProductNews,
  getNpsDashboard,
  getAvailableActions,
  triggerAction,
  submitFeedback,
  getResearchData,
};
