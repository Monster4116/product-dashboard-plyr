import { publicConfig } from '../config/public-config.js';
import { getJson, postJson } from '../utils/http.js';
import {
  mapActionDefinition,
  mapActionRunResult,
  mapCompanyHealth,
  mapDashboardSummary,
  mapFinanceAdjustment,
  mapList,
  mapProductNewsItem,
  mapResearchItem,
  mapSupportTicket,
} from '../mappers/dashboard.mapper.js';
import {
  actionsMockResponse,
  companyHealthMockResponse,
  financeAdjustmentsMockResponse,
  productNewsMockResponse,
  runMockAction,
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

export const getDashboardSummary = async () => {
  const payload = await getJson('/dashboard/summary');

  if (!payload || typeof payload !== 'object') {
    throw new Error('Unexpected response shape from /dashboard/summary.');
  }

  return mapDashboardSummary(payload);
};

export const getSupportTickets = async () =>
  requestList('/dashboard/support-tickets', mapSupportTicket);

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

export const getResearchData = async () => requestList('/dashboard/research', mapResearchItem);

export default {
  getDashboardSummary,
  getSupportTickets,
  getFinanceAdjustments,
  getCompanyHealth,
  getProductNews,
  getAvailableActions,
  triggerAction,
  getResearchData,
};
