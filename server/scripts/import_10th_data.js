const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../db/career_compass_v2.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// The Sacred Data provided by the user
const data = {
    "after_10th": {
        "title": "Career Paths After 10th",
        "description": "Comprehensive career exploration for students completing 10th standard",
        "main_categories": [
            {
                "id": "engineering",
                "name": "Engineering",
                "icon": "⚙️",
                "description": "Technical and engineering paths through diploma and polytechnic",
                "paths": [
                    {
                        "id": "diploma_engineering",
                        "name": "Diploma in Engineering",
                        "duration": "3 years",
                        "eligibility": "10th pass with Mathematics and Science",
                        "specializations": [
                            {
                                "id": "civil_engineering",
                                "name": "Civil Engineering",
                                "description": "Design and construction of infrastructure",
                                "job_roles": ["Junior Civil Engineer", "Site Supervisor", "Quantity Surveyor", "CAD Technician", "Construction Manager"],
                                "skills_required": ["AutoCAD", "Structural Analysis", "Building Materials Knowledge", "Project Management", "Site Planning", "Technical Drawing"],
                                "avg_starting_salary": "₹2.5-4 LPA",
                                "growth_potential": "High",
                                "further_studies": ["B.Tech (Lateral Entry)", "Advanced Diploma", "Certification courses"]
                            },
                            {
                                "id": "mechanical_engineering",
                                "name": "Mechanical Engineering",
                                "description": "Design, manufacturing, and maintenance of mechanical systems",
                                "job_roles": ["Junior Mechanical Engineer", "Production Supervisor", "Quality Control Inspector", "Maintenance Engineer", "CAD Designer"],
                                "skills_required": ["CAD/CAM Software", "Manufacturing Processes", "Thermodynamics", "Machine Design", "Quality Control", "Problem Solving"],
                                "avg_starting_salary": "₹2.5-4.5 LPA",
                                "growth_potential": "Very High",
                                "further_studies": ["B.Tech (Lateral Entry)", "Tool & Die Making", "CNC Programming"]
                            },
                            {
                                "id": "electrical_engineering",
                                "name": "Electrical Engineering",
                                "description": "Electrical systems, power generation, and distribution",
                                "job_roles": ["Electrical Technician", "Junior Electrical Engineer", "Maintenance Engineer", "Power Plant Operator", "Electrical Supervisor"],
                                "skills_required": ["Electrical Circuit Design", "PLC Programming", "Power Systems", "Instrumentation", "Troubleshooting", "Safety Protocols"],
                                "avg_starting_salary": "₹2.5-4 LPA",
                                "growth_potential": "High",
                                "further_studies": ["B.Tech (Lateral Entry)", "Industrial Automation", "Renewable Energy"]
                            },
                            {
                                "id": "electronics_communication",
                                "name": "Electronics & Communication Engineering",
                                "description": "Electronic devices, communication systems, and networks",
                                "job_roles": ["Electronics Technician", "Service Engineer", "Network Technician", "Junior Hardware Engineer", "Testing Engineer"],
                                "skills_required": ["Circuit Design", "PCB Design", "Communication Systems", "Embedded Systems", "Digital Electronics", "Signal Processing"],
                                "avg_starting_salary": "₹2.5-4.5 LPA",
                                "growth_potential": "Very High",
                                "further_studies": ["B.Tech (Lateral Entry)", "VLSI Design", "IoT Specialization"]
                            },
                            {
                                "id": "computer_engineering",
                                "name": "Computer Engineering",
                                "description": "Computer hardware, software, and networking",
                                "job_roles": ["Junior Programmer", "Web Developer", "IT Support Engineer", "Network Administrator", "Software Tester"],
                                "skills_required": ["Programming (C, C++, Java)", "Web Development", "Database Management", "Networking", "Operating Systems", "Problem Solving"],
                                "avg_starting_salary": "₹3-5 LPA",
                                "growth_potential": "Excellent",
                                "further_studies": ["B.Tech (Lateral Entry)", "Advanced Programming", "Cloud Computing"]
                            },
                            {
                                "id": "automobile_engineering",
                                "name": "Automobile Engineering",
                                "description": "Design, manufacturing, and maintenance of vehicles",
                                "job_roles": ["Automobile Technician", "Service Engineer", "Production Supervisor", "Quality Inspector", "Workshop Manager"],
                                "skills_required": ["Vehicle Systems", "Engine Technology", "CAD Software", "Diagnostics", "Maintenance", "Troubleshooting"],
                                "avg_starting_salary": "₹2.5-4 LPA",
                                "growth_potential": "High",
                                "further_studies": ["B.Tech (Lateral Entry)", "EV Technology", "Advanced Diagnostics"]
                            },
                            {
                                "id": "chemical_engineering",
                                "name": "Chemical Engineering",
                                "description": "Chemical processes, production, and quality control",
                                "job_roles": ["Chemical Plant Operator", "Quality Control Analyst", "Process Technician", "Production Supervisor", "Lab Technician"],
                                "skills_required": ["Chemical Processes", "Quality Testing", "Safety Protocols", "Lab Equipment", "Process Control", "Analytical Skills"],
                                "avg_starting_salary": "₹2.5-4 LPA",
                                "growth_potential": "High",
                                "further_studies": ["B.Tech (Lateral Entry)", "Process Engineering", "Safety Management"]
                            },
                            {
                                "id": "agriculture_engineering",
                                "name": "Agriculture Engineering",
                                "description": "Agricultural machinery, irrigation, and farm technology",
                                "job_roles": ["Agricultural Technician", "Farm Equipment Operator", "Irrigation Specialist", "Agricultural Supervisor", "Farm Manager"],
                                "skills_required": ["Agricultural Machinery", "Irrigation Systems", "Soil Science", "Farm Management", "Equipment Maintenance", "Crop Technology"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["B.Tech (Lateral Entry)", "Precision Agriculture", "Farm Mechanization"]
                            }
                        ]
                    },
                    {
                        "id": "iti_courses",
                        "name": "ITI (Industrial Training Institute)",
                        "duration": "1-2 years",
                        "eligibility": "10th pass",
                        "specializations": [
                            {
                                "id": "electrician",
                                "name": "Electrician",
                                "description": "Electrical wiring, installations, and maintenance",
                                "job_roles": ["Electrician", "Electrical Installer", "Maintenance Electrician", "Industrial Electrician", "Wireman"],
                                "skills_required": ["Electrical Wiring", "Circuit Testing", "Safety Standards", "Troubleshooting", "Blueprint Reading", "Installation"],
                                "avg_starting_salary": "₹1.8-3 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["Advanced Electrician Course", "Supervisor Training", "Solar Installation"]
                            },
                            {
                                "id": "fitter",
                                "name": "Fitter",
                                "description": "Assembly, fitting, and maintenance of machinery",
                                "job_roles": ["Mechanical Fitter", "Machine Operator", "Assembly Technician", "Maintenance Fitter", "Workshop Fitter"],
                                "skills_required": ["Hand Tools", "Machine Tools", "Precision Measurement", "Blueprint Reading", "Assembly", "Maintenance"],
                                "avg_starting_salary": "₹1.8-3 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["Advanced Fitting", "CNC Operation", "Tool Making"]
                            },
                            {
                                "id": "welder",
                                "name": "Welder",
                                "description": "Welding and metal fabrication",
                                "job_roles": ["Welder", "Fabricator", "Welding Inspector", "Structural Welder", "Pipeline Welder"],
                                "skills_required": ["Welding Techniques", "Metal Fabrication", "Blueprint Reading", "Safety Protocols", "Quality Control", "Equipment Operation"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["Advanced Welding", "Welding Inspector Certification", "Underwater Welding"]
                            },
                            {
                                "id": "plumber",
                                "name": "Plumber",
                                "description": "Plumbing systems installation and repair",
                                "job_roles": ["Plumber", "Pipefitter", "Plumbing Contractor", "Maintenance Plumber", "Sanitary Inspector"],
                                "skills_required": ["Pipe Fitting", "Water Systems", "Drainage Systems", "Blueprint Reading", "Problem Solving", "Customer Service"],
                                "avg_starting_salary": "₹1.8-3 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["Advanced Plumbing", "Fire Fighting Systems", "Green Plumbing"]
                            },
                            {
                                "id": "copa",
                                "name": "COPA (Computer Operator & Programming Assistant)",
                                "description": "Computer operations, programming, and office applications",
                                "job_roles": ["Data Entry Operator", "Computer Operator", "Office Assistant", "Junior Programmer", "IT Support"],
                                "skills_required": ["MS Office", "Data Entry", "Basic Programming", "Internet Operations", "Database Basics", "Typing Speed"],
                                "avg_starting_salary": "₹1.5-2.5 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["Advanced Programming", "Web Development", "Digital Marketing"]
                            },
                            {
                                "id": "machinist",
                                "name": "Machinist",
                                "description": "Machine operation and precision manufacturing",
                                "job_roles": ["Machine Operator", "CNC Operator", "Lathe Operator", "Tool Maker", "Production Machinist"],
                                "skills_required": ["Machine Operation", "Precision Measurement", "CNC Basics", "Blueprint Reading", "Quality Control", "Tool Selection"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["CNC Programming", "Advanced Machining", "CAD/CAM"]
                            },
                            {
                                "id": "draughtsman",
                                "name": "Draughtsman (Civil/Mechanical)",
                                "description": "Technical drawing and CAD design",
                                "job_roles": ["CAD Technician", "Draughtsman", "Design Assistant", "Technical Illustrator", "Junior Designer"],
                                "skills_required": ["AutoCAD", "Technical Drawing", "Blueprint Reading", "3D Modeling", "Design Standards", "Attention to Detail"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["Advanced CAD", "3D Modeling", "BIM"]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "medical",
                "name": "Medical & Healthcare",
                "icon": "🏥",
                "description": "Healthcare and medical support careers",
                "paths": [
                    {
                        "id": "paramedical",
                        "name": "Paramedical Courses",
                        "duration": "1-3 years",
                        "eligibility": "10th pass with Science",
                        "specializations": [
                            {
                                "id": "nursing_assistant",
                                "name": "General Nursing & Midwifery (GNM)",
                                "description": "Patient care and nursing support",
                                "job_roles": ["Staff Nurse", "Nursing Assistant", "Community Health Nurse", "Ward Nurse", "Home Care Nurse"],
                                "skills_required": ["Patient Care", "Medical Procedures", "Emergency Response", "Hygiene Protocols", "Communication", "Empathy"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["B.Sc Nursing", "Specialization Courses", "Nurse Practitioner"]
                            },
                            {
                                "id": "pharmacy_assistant",
                                "name": "Pharmacy Assistant (D.Pharma)",
                                "description": "Pharmaceutical dispensing and patient counseling",
                                "job_roles": ["Pharmacist", "Medical Representative", "Drug Inspector", "Hospital Pharmacist", "Community Pharmacist"],
                                "skills_required": ["Pharmaceutical Knowledge", "Drug Dispensing", "Patient Counseling", "Inventory Management", "Medical Terminology", "Attention to Detail"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["B.Pharma", "M.Pharma", "Clinical Pharmacy"]
                            },
                            {
                                "id": "lab_technician",
                                "name": "Medical Lab Technician (DMLT)",
                                "description": "Laboratory testing and diagnostics",
                                "job_roles": ["Lab Technician", "Pathology Technician", "Blood Bank Technician", "Diagnostic Lab Assistant", "Research Assistant"],
                                "skills_required": ["Laboratory Equipment", "Sample Testing", "Microscopy", "Quality Control", "Medical Terminology", "Analytical Skills"],
                                "avg_starting_salary": "₹2-3 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["B.Sc MLT", "Specialization in Pathology", "Clinical Research"]
                            },
                            {
                                "id": "xray_technician",
                                "name": "X-Ray Technician",
                                "description": "Medical imaging and radiography",
                                "job_roles": ["X-Ray Technician", "Radiography Assistant", "Imaging Technician", "Diagnostic Center Operator", "Hospital Radiology Staff"],
                                "skills_required": ["Radiography Equipment", "Patient Positioning", "Radiation Safety", "Image Processing", "Anatomy Knowledge", "Technical Skills"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["B.Sc Radiology", "CT/MRI Specialization", "Nuclear Medicine"]
                            },
                            {
                                "id": "ophthalmic_assistant",
                                "name": "Ophthalmic Assistant",
                                "description": "Eye care and vision testing support",
                                "job_roles": ["Ophthalmic Assistant", "Vision Technician", "Optometry Assistant", "Eye Clinic Staff", "Optical Store Assistant"],
                                "skills_required": ["Eye Testing Equipment", "Patient Care", "Vision Assessment", "Frame Selection", "Customer Service", "Medical Records"],
                                "avg_starting_salary": "₹1.8-3 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["B.Sc Optometry", "Contact Lens Specialist", "Low Vision Rehabilitation"]
                            },
                            {
                                "id": "dental_assistant",
                                "name": "Dental Assistant",
                                "description": "Dental care support and patient assistance",
                                "job_roles": ["Dental Assistant", "Dental Hygienist", "Dental Clinic Coordinator", "Orthodontic Assistant", "Dental Lab Assistant"],
                                "skills_required": ["Dental Instruments", "Patient Care", "Sterilization", "Dental Procedures", "Record Keeping", "Communication"],
                                "avg_starting_salary": "₹1.8-3 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["Dental Hygiene Certification", "Dental Technology", "Practice Management"]
                            },
                            {
                                "id": "physiotherapy_assistant",
                                "name": "Physiotherapy Assistant",
                                "description": "Physical therapy and rehabilitation support",
                                "job_roles": ["Physiotherapy Assistant", "Rehabilitation Aide", "Sports Therapy Assistant", "Exercise Therapist", "Mobility Specialist"],
                                "skills_required": ["Anatomy Knowledge", "Exercise Techniques", "Patient Handling", "Therapy Equipment", "Rehabilitation Methods", "Empathy"],
                                "avg_starting_salary": "₹2-3 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["B.P.T", "Sports Physiotherapy", "Rehabilitation Science"]
                            },
                            {
                                "id": "emergency_medical_technician",
                                "name": "Emergency Medical Technician (EMT)",
                                "description": "Emergency care and ambulance services",
                                "job_roles": ["Emergency Medical Technician", "Ambulance Paramedic", "Emergency Room Assistant", "First Responder", "Disaster Response Technician"],
                                "skills_required": ["Emergency Procedures", "CPR & First Aid", "Patient Assessment", "Medical Equipment", "Crisis Management", "Quick Decision Making"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["Advanced EMT", "Paramedic Certification", "Emergency Medicine"]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "commerce",
                "name": "Commerce & Business",
                "icon": "💼",
                "description": "Business, finance, and commercial careers",
                "paths": [
                    {
                        "id": "commercial_courses",
                        "name": "Commercial Diploma Courses",
                        "duration": "1-2 years",
                        "eligibility": "10th pass",
                        "specializations": [
                            {
                                "id": "accounting_taxation",
                                "name": "Accounting & Taxation",
                                "description": "Financial accounting, bookkeeping, and tax preparation",
                                "job_roles": ["Accounts Assistant", "Bookkeeper", "Tax Assistant", "Payroll Executive", "Accounts Clerk"],
                                "skills_required": ["Tally ERP", "GST", "Income Tax", "Bookkeeping", "MS Excel", "Financial Reporting"],
                                "avg_starting_salary": "₹1.8-3 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["B.Com", "CA Foundation", "CMA"]
                            },
                            {
                                "id": "office_management",
                                "name": "Office Management & Secretarial Practice",
                                "description": "Office administration and secretarial work",
                                "job_roles": ["Office Administrator", "Executive Assistant", "Office Coordinator", "Front Desk Manager", "Administrative Assistant"],
                                "skills_required": ["MS Office", "Communication", "Office Management", "Time Management", "Documentation", "Customer Service"],
                                "avg_starting_salary": "₹1.5-2.5 LPA",
                                "growth_potential": "Medium",
                                "further_studies": ["BBA", "Office Management Certification", "HR Management"]
                            },
                            {
                                "id": "banking_finance",
                                "name": "Banking & Finance",
                                "description": "Banking operations and financial services",
                                "job_roles": ["Bank Clerk", "Customer Service Executive", "Loan Officer", "Cash Handler", "Banking Associate"],
                                "skills_required": ["Banking Operations", "Customer Service", "Financial Products", "Cash Management", "Computer Skills", "Numerical Ability"],
                                "avg_starting_salary": "₹2-3.5 LPA",
                                "growth_potential": "High",
                                "further_studies": ["B.Com", "Banking Certifications", "Financial Planning"]
                            },
                            {
                                "id": "retail_management",
                                "name": "Retail Management",
                                "description": "Retail operations and store management",
                                "job_roles": ["Store Manager", "Retail Sales Executive", "Inventory Manager", "Customer Relationship Officer", "Merchandiser"],
                                "skills_required": ["Sales Techniques", "Customer Service", "Inventory Management", "Visual Merchandising", "Team Management", "POS Systems"],
                                "avg_starting_salary": "₹1.8-3 LPA",
                                "growth_potential": "Medium-High",
                                "further_studies": ["BBA", "Retail Management", "Marketing"]
                            },
                            {
                                "id": "insurance",
                                "name": "Insurance & Risk Management",
                                "description": "Insurance sales and policy management",
                                "job_roles": ["Insurance Agent", "Policy Advisor", "Claims Assistant", "Insurance Surveyor", "Customer Service Executive"],
                                "skills_required": ["Insurance Products", "Sales Skills", "Risk Assessment", "Communication", "Customer Relations", "Documentation"],
                                "avg_starting_salary": "₹2-4 LPA (with incentives)",
                                "growth_potential": "High",
                                "further_studies": ["Insurance Certifications", "Risk Management", "Financial Planning"]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

const run = () => {
    const rootId = 100;
    const treeId = 1;

    const stmtInsertNode = db.prepare(`
        INSERT INTO nodes (title, node_type, level, description, icon, duration) 
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const stmtInsertEdge = db.prepare(`
        INSERT OR IGNORE INTO edges (parent_node_id, child_node_id, order_index) 
        VALUES (?, ?, ?)
    `);

    const stmtInsertTreeNode = db.prepare(`
        INSERT OR IGNORE INTO tree_nodes (tree_id, node_id, is_root) 
        VALUES (?, ?, 0)
    `);

    const insertNode = (title, type, level, desc, icon, duration = null) => {
        const info = stmtInsertNode.run(title, type, level, desc, icon, duration);
        return info.lastInsertRowid;
    };

    const insertEdge = (parent, child, index) => {
        stmtInsertEdge.run(parent, child, index);
    };

    const insertTreeNode = (nodeId) => {
        stmtInsertTreeNode.run(treeId, nodeId);
    };

    try {
        console.log('Starting data import for After 10th...');

        // Use a transaction for speed and safety
        db.transaction(() => {
            // Loop through Categories (Level 2)
            data.after_10th.main_categories.forEach((cat, i) => {
                const catNodeId = insertNode(cat.name, 'path', 2, cat.description, cat.icon);
                insertEdge(rootId, catNodeId, i);
                insertTreeNode(catNodeId);
                console.log(`- Inserted Category: ${cat.name}`);

                // Loop through Paths (Level 3)
                cat.paths.forEach((p, j) => {
                    const pathNodeId = insertNode(p.name, 'option', 3, p.eligibility, '📜', p.duration);
                    insertEdge(catNodeId, pathNodeId, j);
                    insertTreeNode(pathNodeId);

                    // Loop through Specializations (Level 4)
                    p.specializations.forEach((s, k) => {
                        const spNodeId = insertNode(s.name, 'option', 4, s.description, '✨');
                        insertEdge(pathNodeId, spNodeId, k);
                        insertTreeNode(spNodeId);

                        // Loop through Job Roles (Level 5 Outcomes)
                        s.job_roles.forEach((role, l) => {
                            const roleNodeId = insertNode(role, 'outcome', 5, `Avg Salary: ${s.avg_starting_salary}`, '💼');
                            insertEdge(spNodeId, roleNodeId, l);
                            insertTreeNode(roleNodeId);
                        });
                    });
                });
            });
        })();

        console.log('Successfully imported After 10th data.');
    } catch (err) {
        console.error('Error during import:', err);
    } finally {
        db.close();
    }
};

run();
