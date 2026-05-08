
# Record Structure

| Column Header                 | Description                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                            | Unique identifier for the invoice result record.                                                                                                       |
| employeeId                    | Unique identifier for the employee linked to the invoice result.                                                                                       |
| companyId                     | Unique identifier for the company linked to the invoice result.                                                                                        |
| invoiceDate                   | The applicable invoice month/date for the invoice result.                                                                                              |
| payPeriodStart                | Start date of the pay period. Primarily used for [[usa-pay-periods]].                                                                                  |
| payPeriodEnd                  | End date of the pay period. Primarily used for [[usa-pay-periods]].                                                                                    |
| employeeData                  | Employee-specific context used during calculation. See [[employee-data]].                                                                              |
| salaryTotalsFull              | Full [[totals-breakdown]] for the current pay cycle.                                                                                                   |
| salaryTotalsProrated          | Prorated [[totals-breakdown]] for days worked in a previous or partial pay cycle.                                                                      |
| employerContributionsFull     | Full [[employer-contribution-breakdown]] for the current pay cycle.                                                                                    |
| employerContributionsProrated | Prorated [[employer-contribution-breakdown]] for employee pay from days worked in a previous or partial pay cycle.                                     |
| employeeContributionsFull     | Full [[employee-contributions-breakdown]] for the current pay cycle.                                                                                   |
| employeeContributionsProrated | Prorated [[employee-contributions-breakdown]] for employee pay from days worked in a previous or partial pay cycle.                                    |
| terminationResults            | Employee [[termination-results]] applicable to the current pay cycle.                                                                                  |
| leaveIds                      | IDs for leave requests included in the pay cycle.                                                                                                      |
| expenseIds                    | IDs for expense records included in the pay cycle.                                                                                                     |
| type                          | Specifies the [[invoice-record-type]].                                                                                                                 |
| createdAt                     | Date and time when the invoice result record was created.                                                                                              |
| updatedAt                     | Date and time when the invoice result record was last updated.                                                                                         |
| calculationPeriod             | Specifies the calculation period. Can be either `MONTHLY` or `BI_WEEKLY`. See [[usa-pay-periods]].                                                     |
| isAggregated                  | Indicates whether multiple pay cycle results have been aggregated into a single monthly result. Mainly used for US employees. See [[usa-pay-periods]]. |
| isPrimary                     | Indicates whether this is the primary invoice result record. Related to [[invoice-record-type]].                                                       |
| exchangeRateContext           | Exchange rate context used for currency conversion. See [[exchange-rates]] and [[salary-payment-options]].                                             |
| timeTrackingIds               | IDs for time tracking records used for [[hourly-employees]].                                                                                           |
| leavePayoutAdjustmentContext  | Breakdown of leave payout adjustments. See [[leave-adjustment]].                                                                                       |