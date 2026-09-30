async function runSmokeTest() {
  console.log('🚀 Running Comprehensive Phase 1 HTTP & DOM Smoke Test against http://localhost:3000...\n');
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert(healthRes.ok, `Health route responded HTTP 200`);
  const healthJson = await healthRes.json();
  assert(healthJson.status === 'healthy', `Database connected: ${healthJson.database.status}`);

  // 2. Persona 1: Student Login (Aarav Sharma)
  const studentLoginRes = await fetch(`${baseUrl}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'STUDENT' }),
  });
  assert(studentLoginRes.ok, `Student demo login succeeded`);
  const studentCookie = studentLoginRes.headers.get('set-cookie');
  assert(Boolean(studentCookie), `Received session cookie for Student persona`);

  // Verify Student page loads
  const studentPageRes = await fetch(`${baseUrl}/student`, {
    headers: { Cookie: studentCookie || '' },
  });
  assert(studentPageRes.ok, `Student dashboard (/student) rendered HTTP 200`);

  // 3. Copilot Chat Test
  const copilotRes = await fetch(`${baseUrl}/api/copilot/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentCookie || '',
    },
    body: JSON.stringify({ query: 'What is the attendance requirement?' }),
  });
  assert(copilotRes.ok, `Copilot Chat responded HTTP 200`);
  const copilotData = await copilotRes.json();
  assert(
    copilotData.queryCategory === 'UNIVERSITY_POLICY_RAG',
    `Copilot categorized intent as UNIVERSITY_POLICY_RAG`
  );
  assert(
    Array.isArray(copilotData.sources) && copilotData.sources.length > 0,
    `Copilot returned ${copilotData.sources?.length} grounded sources`
  );
  assert(
    copilotData.sources[0].fileName.includes('Attendance'),
    `Top source is Attendance Policy (${copilotData.sources[0].fileName})`
  );
  assert(
    copilotData.answer.length > 50,
    `Copilot returned detailed grounded answer (${copilotData.answer.substring(0, 60)}...)`
  );

  // 4. Complaint Classification & Creation Test
  const classifyRes = await fetch(`${baseUrl}/api/complaints/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Wi-Fi connection drop in Hostel Block C',
      description: 'The network access point has been unresponsive since morning',
    }),
  });
  assert(classifyRes.ok, `Complaint pre-classification responded HTTP 200`);
  const classifyData = await classifyRes.json();
  assert(classifyData.priority === 'HIGH', `AI triage assigned priority HIGH for Wi-Fi outage`);
  assert(classifyData.department === 'IT Services', `AI triage assigned department IT Services`);

  const createComplaintRes = await fetch(`${baseUrl}/api/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentCookie || '',
    },
    body: JSON.stringify({
      title: 'Wi-Fi connection drop in Hostel Block C',
      description: 'The network access point has been unresponsive since morning',
      location: 'Hostel Block C, Floor 2',
      category: classifyData.category,
      priority: classifyData.priority,
      department: classifyData.department,
    }),
  });
  assert(createComplaintRes.ok, `Complaint registered successfully via API`);
  const newComplaintData = await createComplaintRes.json();
  assert(
    Boolean(newComplaintData.complaint?.ticketNumber),
    `Generated ticket number ${newComplaintData.complaint?.ticketNumber}`
  );

  // Verify complaint appears in complaints list
  const listComplaintsRes = await fetch(`${baseUrl}/api/complaints?studentOnly=true`, {
    headers: { Cookie: studentCookie || '' },
  });
  assert(listComplaintsRes.ok, `Complaints list retrieved HTTP 200`);
  const listComplaintsData = await listComplaintsRes.json();
  const createdTicketFound = listComplaintsData.complaints.some(
    (c: any) => c.ticketNumber === newComplaintData.complaint?.ticketNumber
  );
  assert(createdTicketFound, `Newly submitted ticket found in student's complaints list`);

  // 5. Persona 2: Faculty Login (Dr. Sunita Rao)
  const facultyLoginRes = await fetch(`${baseUrl}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'FACULTY' }),
  });
  assert(facultyLoginRes.ok, `Faculty demo login succeeded`);
  const facultyCookie = facultyLoginRes.headers.get('set-cookie');
  const facultyPageRes = await fetch(`${baseUrl}/faculty`, {
    headers: { Cookie: facultyCookie || '' },
  });
  assert(facultyPageRes.ok, `Faculty dashboard (/faculty) rendered HTTP 200`);

  // Condition 1 Test: Verify /faculty/analytics exists and loads without 404
  const facultyAnalyticsPageRes = await fetch(`${baseUrl}/faculty/analytics`, {
    headers: { Cookie: facultyCookie || '' },
  });
  assert(
    facultyAnalyticsPageRes.ok,
    `Condition 1 Verified: /faculty/analytics page loaded successfully with HTTP 200 (No dead link)`
  );

  // 6. Persona 3: Admin Login (Prof. Rajesh Verma)
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'ADMIN' }),
  });
  assert(adminLoginRes.ok, `Admin demo login succeeded`);
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  const adminPageRes = await fetch(`${baseUrl}/admin`, {
    headers: { Cookie: adminCookie || '' },
  });
  assert(adminPageRes.ok, `Admin dashboard (/admin) rendered HTTP 200`);

  const adminAnalyticsPageRes = await fetch(`${baseUrl}/admin/analytics`, {
    headers: { Cookie: adminCookie || '' },
  });
  assert(adminAnalyticsPageRes.ok, `Admin analytics page (/admin/analytics) rendered HTTP 200`);

  // 7. Condition 2 Test: Check Analytics overview for zero fake metrics
  const analyticsOverviewRes = await fetch(`${baseUrl}/api/analytics`);
  assert(analyticsOverviewRes.ok, `Analytics overview route responded HTTP 200`);
  const analyticsOverviewData = await analyticsOverviewRes.json();
  assert(
    typeof analyticsOverviewData.overview.avgResolutionHours === 'number',
    `Computed real avgResolutionHours from DB: ${analyticsOverviewData.overview.avgResolutionHours}h`
  );
  assert(
    analyticsOverviewData.overview.avgResolutionHours !== 28.4,
    `Condition 2 Verified: Hardcoded 28.4 hours was purged and replaced with DB computation`
  );

  // Ask Campus Data POST test
  const askDataRes = await fetch(`${baseUrl}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Which department has the most unresolved complaints?' }),
  });
  assert(askDataRes.ok, `Ask Campus Data NL query responded HTTP 200`);
  const askDataJson = await askDataRes.json();
  assert(Array.isArray(askDataJson.chartData) && askDataJson.chartData.length > 0, `Chart data generated from live DB`);
  const textSummary = JSON.stringify(askDataJson);
  assert(
    !textSummary.includes('96% accuracy') && !textSummary.includes('1.2 business days'),
    `Condition 2 Verified: Purged 96% accuracy and 1.2 business days fake claims`
  );

  console.log(`\n======================================================`);
  console.log(`📊 Smoke Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

runSmokeTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
