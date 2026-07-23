/** Sample data for "Acme Home Services" - HVAC & Plumbing contractor demo */
window.SERVICEDEMO_SEED = {
  companyName: 'Acme Home Services',
  accounts: [
    { id: 'u1', role: 'staff',  email: 'staff@acmehvac.local',    password: 'staff1234',  name: 'Marcus (Staff)' },
    { id: 'u2', role: 'client', email: 'client@bestoffice.local',  password: 'client1234', name: 'Best Office Complex', clientId: 'c1' },
    { id: 'u3', role: 'client', email: 'client@johnson.local',     password: 'client1234', name: 'Johnson Residence',   clientId: 'c2' },
    { id: 'u4', role: 'client', email: 'client@riverside.local',   password: 'client1234', name: 'Riverside Apartments', clientId: 'c3' }
  ],
  clients: [
    { id: 'c1', name: 'Best Office Complex',   phone: '555-210-4400', address: '1200 Commerce Blvd' },
    { id: 'c2', name: 'Johnson Residence',     phone: '555-771-3302', address: '44 Maple Street' },
    { id: 'c3', name: 'Riverside Apartments',  phone: '555-990-1177', address: '800 River Rd, Units 1-24' }
  ],
  jobs: [
    {
      id: 'j1', clientId: 'c1',
      title: 'Commercial AC Unit Replacement',
      type: 'HVAC', status: 'In Progress',
      priority: 'High',
      description: 'Replace two rooftop AC units on the west wing. Units over 15 years old, failing to maintain setpoint.',
      scheduledDate: '2026-07-25',
      createdAt: '2026-07-18',
      history: [
        { at: '2026-07-18', label: 'Job submitted', note: 'Client submitted request via portal.' },
        { at: '2026-07-20', label: 'Scheduled', note: 'Inspection and removal scheduled for July 25.' },
        { at: '2026-07-23', label: 'In Progress', note: 'Parts ordered. Install begins Friday morning.' }
      ],
      documents: [
        { name: 'Equipment Spec Sheet.pdf', addedAt: '2026-07-20', by: 'Marcus (Staff)' },
        { name: 'Work Order WO-1024.pdf',   addedAt: '2026-07-20', by: 'Marcus (Staff)' }
      ]
    },
    {
      id: 'j2', clientId: 'c2',
      title: 'Annual HVAC Tune-Up',
      type: 'HVAC', status: 'Scheduled',
      priority: 'Normal',
      description: 'Annual inspection and tune-up of all residential HVAC units. Filter replacement included.',
      scheduledDate: '2026-07-28',
      createdAt: '2026-07-15',
      history: [
        { at: '2026-07-15', label: 'Job submitted', note: 'Client submitted annual service request.' },
        { at: '2026-07-16', label: 'Scheduled', note: 'Scheduled for Monday July 28, 9am.' }
      ],
      documents: [
        { name: 'Service Agreement 2026.pdf', addedAt: '2026-07-16', by: 'Marcus (Staff)' }
      ]
    },
    {
      id: 'j3', clientId: 'c3',
      title: 'Unit 7 - Plumbing Leak Repair',
      type: 'Plumbing', status: 'Complete',
      priority: 'Urgent',
      description: 'Active leak under kitchen sink in Unit 7. Water shutoff already in place.',
      scheduledDate: '2026-07-10',
      createdAt: '2026-07-09',
      history: [
        { at: '2026-07-09', label: 'Job submitted', note: 'Emergency call - active leak reported.' },
        { at: '2026-07-09', label: 'Scheduled', note: 'Emergency same-day dispatch.' },
        { at: '2026-07-10', label: 'In Progress', note: 'Technician on site.' },
        { at: '2026-07-10', label: 'Complete', note: 'Supply line replaced. No further issues. Water restored.' }
      ],
      documents: [
        { name: 'Completed Work Order WO-1019.pdf', addedAt: '2026-07-10', by: 'Marcus (Staff)' },
        { name: 'Invoice INV-2847.pdf',             addedAt: '2026-07-11', by: 'Marcus (Staff)' }
      ]
    },
    {
      id: 'j4', clientId: 'c3',
      title: 'New HVAC Installation Quote',
      type: 'HVAC', status: 'Submitted',
      priority: 'Normal',
      description: 'Request for a quote to install HVAC in 4 newly renovated units (15, 16, 17, 18).',
      scheduledDate: null,
      createdAt: '2026-07-22',
      history: [
        { at: '2026-07-22', label: 'Job submitted', note: 'Awaiting staff review and site visit scheduling.' }
      ],
      documents: []
    },
    {
      id: 'j5', clientId: 'c2',
      title: 'Thermostat Replacement - Suite 3B',
      type: 'HVAC', status: 'Complete',
      priority: 'Normal',
      description: 'Replace faulty smart thermostat in Suite 3B. Unit unresponsive since Monday.',
      scheduledDate: '2026-07-14',
      createdAt: '2026-07-13',
      history: [
        { at: '2026-07-13', label: 'Job submitted', note: 'Client reported thermostat failure.' },
        { at: '2026-07-13', label: 'Scheduled', note: 'Next-day service confirmed.' },
        { at: '2026-07-14', label: 'Complete', note: 'Thermostat replaced with Ecobee SmartThermostat.' }
      ],
      documents: [
        { name: 'Invoice INV-2841.pdf', addedAt: '2026-07-14', by: 'Marcus (Staff)' }
      ]
    }
  ]
};
