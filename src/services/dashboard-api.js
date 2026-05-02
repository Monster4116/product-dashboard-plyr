import { publicConfig } from '../config/public-config.js';
import { requestJson } from '../utils/http.js';
import {
  mapDashboardSummary,
  mapFinanceAdjustmentItem,
  mapList,
  mapResearchDataItem,
  mapSupportTicketItem,
} from '../mappers/dashboard.mapper.js';

// Frontend pages should call these service functions instead of
// attempting to talk directly to a privileged database.
// This file is the frontend boundary for future dashboard API paths.

const buildApiUrl = (path) => `${publicConfig.apiBaseUrl}${path}`;

const requestList = async (path, mapper) => {
  const payload = await requestJson(buildApiUrl(path));

  if (Array.isArray(payload)) {
    return mapList(payload, mapper);
  }

  if (payload && Array.isArray(payload.items)) {
    return mapList(payload.items, mapper);
  }

  throw new Error(`Unexpected response shape from ${path}.`);
};

export const getDashboardSummary = async () => {
  const payload = await requestJson(buildApiUrl('/dashboard/summary'));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Unexpected response shape from /dashboard/summary.');
  }

  return mapDashboardSummary(payload);
};

export const getSupportTickets = async () => requestList('/support/tickets', mapSupportTicketItem);

export const getFinanceAdjustments = async () =>
  requestList('/finance-adjustments', mapFinanceAdjustmentItem);

export const getResearchData = async () => requestList('/research', mapResearchDataItem);

export default {
  getDashboardSummary,
  getSupportTickets,
  getFinanceAdjustments,
  getResearchData,
};
