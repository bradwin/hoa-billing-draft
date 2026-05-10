# Component Methods

Method signatures are high-level TypeScript-style contracts. Detailed data fields, algorithms, validation rules, persistence models, and exact DTOs will be defined later during Functional Design and Code Generation.

## Shared Types

```typescript
type ID = string;
type DecimalString = string;

interface ActorContext {
  userId: ID;
  roles: string[];
  homeownerId?: ID;
  correlationId: string;
}

interface PageRequest {
  page: number;
  pageSize: number;
  sort?: string;
}

interface PageResult<T> {
  items: T[];
  total: number;
}

interface DateRange {
  from: string;
  to: string;
}
```

## C-01 Web Frontend

- `renderAdminPortal(actor: ActorContext): Promise<ViewModel>` - Render role-aware operational shell.
- `renderHomeownerPortal(actor: ActorContext): Promise<ViewModel>` - Render homeowner self-service shell.
- `submitCommand<TInput, TResult>(path: string, input: TInput): Promise<TResult>` - Submit authenticated command requests.
- `uploadFile(path: string, file: File): Promise<FileReference>` - Upload payment proof or import file.
- `downloadDocument(documentId: ID): Promise<Blob>` - Download authorized generated document.

## C-02 Backend API Shell

- `registerRoutes(): void` - Register resource and command controllers.
- `validateRequest(schemaId: string, payload: unknown): ValidatedRequest` - Validate incoming payloads.
- `executeCommand<T>(actor: ActorContext, command: Command<T>): Promise<T>` - Apply authorization, transaction context, and service dispatch.
- `queryResource<T>(actor: ActorContext, query: Query<T>): Promise<T>` - Apply authorization and return read models.

## C-03 Identity and Access Control

- `inviteUser(actor: ActorContext, input: InviteUserInput): Promise<UserInvitation>`
- `activateInvitation(input: ActivateInvitationInput): Promise<UserSession>`
- `authenticate(input: LoginInput): Promise<UserSession>`
- `requestPasswordReset(input: PasswordResetRequest): Promise<void>`
- `resetPassword(input: PasswordResetInput): Promise<void>`
- `requirePermission(actor: ActorContext, permission: string): Promise<void>`
- `authorizeResource(actor: ActorContext, resource: ResourceRef, action: string): Promise<void>`
- `listAssignableRoles(actor: ActorContext): Promise<Role[]>`

## C-04 Homeowner and Property

- `createHomeowner(actor: ActorContext, input: CreateHomeownerInput): Promise<Homeowner>`
- `updateHomeowner(actor: ActorContext, homeownerId: ID, input: UpdateHomeownerInput): Promise<Homeowner>`
- `searchHomeowners(actor: ActorContext, filter: HomeownerFilter, page: PageRequest): Promise<PageResult<HomeownerSummary>>`
- `createProperty(actor: ActorContext, input: CreatePropertyInput): Promise<Property>`
- `updateProperty(actor: ActorContext, propertyId: ID, input: UpdatePropertyInput): Promise<Property>`
- `assignPrimaryOwner(actor: ActorContext, propertyId: ID, input: OwnershipInput): Promise<OwnershipHistory>`
- `validateBillableProperty(propertyId: ID): Promise<BillablePropertyValidation>`
- `submitContactChange(actor: ActorContext, input: ContactChangeInput): Promise<ContactChangeRequest>`
- `decideContactChange(actor: ActorContext, requestId: ID, decision: ApprovalDecision): Promise<ContactChangeRequest>`

## C-05 Billing Configuration

- `getActiveRateForPeriod(billingPeriodStart: string): Promise<RateRule>`
- `configureRate(actor: ActorContext, input: RateRuleInput): Promise<RateRule>`
- `configureChargeType(actor: ActorContext, input: ChargeTypeInput): Promise<ChargeType>`
- `configureDueDateRule(actor: ActorContext, input: DueDateRuleInput): Promise<DueDateRule>`
- `calculateDueDate(period: BillingPeriod): Promise<string>`
- `nextInvoiceNumber(actor: ActorContext): Promise<string>`
- `nextReceiptNumber(actor: ActorContext): Promise<string>`
- `getEmailTemplate(templateType: string): Promise<EmailTemplate>`

## C-06 Invoice

- `generateRecurringDrafts(actor: ActorContext, input: BillingBatchInput): Promise<BillingBatchResult>`
- `createManualDraft(actor: ActorContext, input: ManualInvoiceInput): Promise<Invoice>`
- `previewInvoice(actor: ActorContext, invoiceId: ID): Promise<InvoicePreview>`
- `issueInvoice(actor: ActorContext, invoiceId: ID): Promise<IssuedInvoice>`
- `issueInvoiceBatch(actor: ActorContext, batchId: ID): Promise<IssueBatchResult>`
- `voidInvoice(actor: ActorContext, invoiceId: ID, request: FinancialActionRequest): Promise<ApprovalRequest>`
- `cancelDraft(actor: ActorContext, invoiceId: ID, reason: string): Promise<Invoice>`
- `getInvoiceSnapshot(invoiceId: ID): Promise<InvoiceSnapshot>`
- `listInvoices(actor: ActorContext, filter: InvoiceFilter, page: PageRequest): Promise<PageResult<InvoiceSummary>>`

## C-07 Account Balance

- `getAccountBalance(actor: ActorContext, billingAccountId: ID): Promise<AccountBalanceView>`
- `getInvoiceBalance(invoiceId: ID): Promise<InvoiceBalanceView>`
- `calculateAging(actor: ActorContext, asOfDate: string, filter: AgingFilter): Promise<AgingSummary>`
- `validatePostingImpact(input: PostingImpactInput): Promise<PostingImpactValidation>`
- `buildBalanceSnapshot(billingAccountId: ID, asOfDate: string): Promise<BalanceSnapshot>`
- `reconcileAccount(billingAccountId: ID): Promise<ReconciliationResult>`

## C-08 Payment

- `submitPaymentProof(actor: ActorContext, input: PaymentProofInput): Promise<Payment>`
- `verifyPayment(actor: ActorContext, paymentId: ID, input: PaymentVerificationInput): Promise<Payment>`
- `postPayment(actor: ActorContext, paymentId: ID, allocation?: AllocationInput): Promise<PostedPaymentResult>`
- `allocatePayment(input: PaymentAllocationCommand): Promise<PaymentAllocationResult>`
- `createCredit(input: CreditCreationInput): Promise<Credit>`
- `reversePayment(actor: ActorContext, paymentId: ID, request: FinancialActionRequest): Promise<ApprovalRequest>`
- `listPayments(actor: ActorContext, filter: PaymentFilter, page: PageRequest): Promise<PageResult<PaymentSummary>>`

## C-09 Receipt

- `generateReceipt(actor: ActorContext, paymentId: ID): Promise<Receipt>`
- `getReceipt(actor: ActorContext, receiptId: ID): Promise<ReceiptView>`
- `requestReceiptCancellation(actor: ActorContext, receiptId: ID, request: FinancialActionRequest): Promise<ApprovalRequest>`
- `markReceiptReversed(paymentReversalId: ID): Promise<Receipt>`
- `listReceipts(actor: ActorContext, filter: ReceiptFilter, page: PageRequest): Promise<PageResult<ReceiptSummary>>`

## C-10 Penalty and Delinquency

- `identifyOverdueInvoices(asOfDate: string): Promise<OverdueInvoice[]>`
- `classifyAging(invoiceId: ID, asOfDate: string): Promise<AgingBucket>`
- `applyMonthlyPenalties(actor: ActorContext, input: PenaltyRunInput): Promise<PenaltyRunResult>`
- `requestPenaltyWaiver(actor: ActorContext, penaltyId: ID, request: FinancialActionRequest): Promise<ApprovalRequest>`
- `getReminderCandidates(level: ReminderLevel, asOfDate: string): Promise<ReminderCandidate[]>`
- `listPenalties(actor: ActorContext, filter: PenaltyFilter, page: PageRequest): Promise<PageResult<PenaltySummary>>`

## C-11 Statement of Account

- `generateStatement(actor: ActorContext, input: StatementRequest): Promise<StatementOfAccount>`
- `generateBatchStatements(actor: ActorContext, input: BatchStatementRequest): Promise<BatchStatementResult>`
- `getStatement(actor: ActorContext, statementId: ID): Promise<StatementView>`
- `emailStatement(actor: ActorContext, statementId: ID): Promise<EmailLog>`
- `buildRunningBalance(input: StatementActivityInput): Promise<RunningBalanceResult>`

## C-12 Reporting and Dashboard

- `getDashboard(actor: ActorContext, filter: DashboardFilter): Promise<DashboardView>`
- `generateReport(actor: ActorContext, input: ReportRequest): Promise<ReportResult>`
- `exportReport(actor: ActorContext, reportId: ID, format: ExportFormat): Promise<DocumentReference>`
- `listReports(actor: ActorContext): Promise<ReportDefinition[]>`
- `queryReportData(actor: ActorContext, input: ReportQuery): Promise<ReportDataSet>`

## C-13 Import

- `uploadImportFile(actor: ActorContext, input: ImportUploadInput): Promise<ImportBatch>`
- `validateImportBatch(actor: ActorContext, batchId: ID): Promise<ImportValidationResult>`
- `previewImportBatch(actor: ActorContext, batchId: ID): Promise<ImportPreview>`
- `applyImportBatch(actor: ActorContext, batchId: ID): Promise<ImportApplyResult>`
- `exportImportExceptions(actor: ActorContext, batchId: ID): Promise<DocumentReference>`

## C-14 Notification

- `queueEmail(actor: ActorContext, input: EmailRequest): Promise<EmailLog>`
- `sendQueuedEmail(emailLogId: ID): Promise<EmailLog>`
- `resendEmail(actor: ActorContext, emailLogId: ID): Promise<EmailLog>`
- `renderTemplate(templateType: string, context: EmailContext): Promise<RenderedEmail>`
- `listEmailLogs(actor: ActorContext, filter: EmailLogFilter, page: PageRequest): Promise<PageResult<EmailLog>>`

## C-15 Document Generation

- `generateInvoicePdf(actor: ActorContext, invoiceId: ID): Promise<DocumentReference>`
- `generateReceiptPdf(actor: ActorContext, receiptId: ID): Promise<DocumentReference>`
- `generateStatementPdf(actor: ActorContext, statementId: ID): Promise<DocumentReference>`
- `generateReportExport(actor: ActorContext, reportId: ID, format: ExportFormat): Promise<DocumentReference>`
- `renderPdf(templateType: string, snapshot: DocumentSnapshot): Promise<GeneratedDocument>`

## C-16 Storage

- `storeFile(actor: ActorContext, input: StoreFileInput): Promise<FileReference>`
- `getFile(actor: ActorContext, fileId: ID): Promise<FileDownload>`
- `validateUpload(input: UploadValidationInput): Promise<UploadValidationResult>`
- `deleteTemporaryFile(actor: ActorContext, fileId: ID): Promise<void>`
- `linkFileToRecord(actor: ActorContext, fileId: ID, resource: ResourceRef): Promise<FileReference>`

## C-17 Audit

- `recordAudit(entry: AuditEntryInput): Promise<AuditEntry>`
- `recordFinancialChange(input: FinancialAuditInput): Promise<AuditEntry>`
- `recordSecurityEvent(input: SecurityAuditInput): Promise<AuditEntry>`
- `queryAudit(actor: ActorContext, filter: AuditFilter, page: PageRequest): Promise<PageResult<AuditEntry>>`
- `buildAuditTrailReport(actor: ActorContext, filter: AuditFilter): Promise<ReportDataSet>`

## C-18 Approval Workflow

- `createApprovalRequest(actor: ActorContext, input: ApprovalRequestInput): Promise<ApprovalRequest>`
- `approveRequest(actor: ActorContext, requestId: ID, decision: ApprovalDecisionInput): Promise<ApprovalResult>`
- `rejectRequest(actor: ActorContext, requestId: ID, decision: ApprovalDecisionInput): Promise<ApprovalResult>`
- `listPendingApprovals(actor: ActorContext, filter: ApprovalFilter, page: PageRequest): Promise<PageResult<ApprovalRequest>>`
- `applyApprovedAction(requestId: ID): Promise<ApprovedActionResult>`

## C-19 Job Orchestration

- `scheduleJob(actor: ActorContext, input: JobScheduleInput): Promise<JobDefinition>`
- `runBillingBatchJob(jobId: ID): Promise<JobRunResult>`
- `runPenaltyJob(jobId: ID): Promise<JobRunResult>`
- `runReminderJob(jobId: ID): Promise<JobRunResult>`
- `runEmailRetryJob(jobId: ID): Promise<JobRunResult>`
- `runBatchStatementJob(jobId: ID): Promise<JobRunResult>`
- `getJobStatus(actor: ActorContext, jobRunId: ID): Promise<JobRunStatus>`

## C-20 Shared Kernel

- `createMoney(amount: DecimalString, currency: string): Money`
- `roundMoney(amount: DecimalString, rule: RoundingRule): Money`
- `parseBillingPeriod(input: BillingPeriodInput): BillingPeriod`
- `createAuditContext(actor: ActorContext, reason?: string): AuditContext`
- `withTransaction<T>(work: TransactionWork<T>): Promise<T>`
- `buildError(code: string, message: string, details?: unknown): DomainError`

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Method contracts include authorization, actor context, audit context, upload validation, and security event recording. Detailed SECURITY-05 validation schemas and SECURITY-08 guards will be enforced during design and code generation. |
| Property-Based Testing | N/A | Method signatures preserve boundaries needed for later PBT property identification but do not define algorithms yet. |

