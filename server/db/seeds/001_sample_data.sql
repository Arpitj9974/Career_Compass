-- Seed Data for Career Compass
-- Matches User's "Complete Decision Tree" for After 12th
-- Preserves the 4 main roots

-- Users
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@careercompass.com', '$2a$10$rKN3HzGzsuV.9BTqC2fLqe4GEKqTnI3IpD8Sp6JNlH8s5JdKzQb.2', 'Admin', 'admin'),
('student@demo.com', '$2a$10$rKN3HzGzsuV.9BTqC2fLqe4GEKqTnI3IpD8Sp6JNlH8s5JdKzQb.2', 'Demo Student', 'student');

-- Trees
INSERT INTO trees (name, description, status, created_by) VALUES 
('Main Explorer', 'The main career exploration map', 'published', 1);

-- ============================================
-- LEVEL 1: GOAL NODES (Roots)
-- ============================================
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(1, 'After 12th', 'goal', 1, 'Standard paths after high school', '🎓'),
(100, 'After 10th', 'goal', 1, 'Early career paths', '🎯'),
(200, 'Career Switch', 'goal', 1, 'Transitioning to a new field', '💼'),
(300, 'Skill Based', 'goal', 1, 'Short-term certifications', '⚡');

-- ============================================
-- LEVEL 2: PATHS (Children of "After 12th" - ID 1)
-- ============================================
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(10, 'Engineering', 'path', 2, 'Technical & Innovation', '⚙️'),
(11, 'Medical', 'path', 2, 'Healthcare & Medicine', '🏥'),
(12, 'Commerce', 'path', 2, 'Business & Finance', '📊'),
(13, 'Arts/Humanities', 'path', 2, 'Creativity & Social Sciences', '🎨'),
(14, 'Science (Non-Med)', 'path', 2, 'Research & Pure Sciences', '🔬'),
(15, 'Design & Creative', 'path', 2, 'Visual Arts & Media', '🖌️'),
(16, 'Aviation', 'path', 2, 'Flight & Airport', '✈️'),
(17, 'Defense', 'path', 2, 'Uniformed Services', '🛡️'),
(18, 'Agriculture', 'path', 2, 'Farming & Food Tech', '🌾'),
(19, 'Skill/Vocational', 'path', 2, 'Practical Skills', '🛠️'),
(20, 'Government Jobs', 'path', 2, 'Public Service', '🏛️');

-- ============================================
-- LEVEL 3: OPTIONS (Children of Paths)
-- ============================================

-- Path 1: Engineering (ID 10)
INSERT INTO nodes (id, title, node_type, level, description, duration, icon) VALUES 
(101, 'B.Tech', 'option', 3, 'Bachelor of Technology', '4 Years', '🎓'),
(102, 'Diploma', 'option', 3, 'Engineering Diploma', '3 Years', '📜'),
(103, 'B.Arch', 'option', 3, 'Bachelor of Architecture', '5 Years', '🏛️'),
(104, 'Polytechnic', 'option', 3, 'Technical Trades', '3 Years', '🔧'),
(105, 'Integrated', 'option', 3, 'B.Tech + M.Tech', '5 Years', '➕');

-- Path 2: Medical (ID 11)
INSERT INTO nodes (id, title, node_type, level, description, duration, icon) VALUES 
(111, 'MBBS', 'option', 3, 'Medicine & Surgery', '5.5 Years', '⚕️'),
(112, 'BDS', 'option', 3, 'Dental Surgery', '5 Years', '🦷'),
(113, 'BAMS', 'option', 3, 'Ayurveda', '5.5 Years', '🌿'),
(114, 'BHMS', 'option', 3, 'Homeopathy', '5.5 Years', '💊'),
(115, 'Nursing', 'option', 3, 'B.Sc Nursing', '4 Years', '🏥'),
(116, 'Pharmacy', 'option', 3, 'B.Pharm', '4 Years', '💊'),
(117, 'Physiotherapy', 'option', 3, 'BPT', '4.5 Years', '🦴'),
(118, 'Paramedical', 'option', 3, 'Medical Tech', '3-4 Years', '🔬'),
(119, 'Veterinary', 'option', 3, 'BVSc', '5 Years', '🐾');

-- Path 3: Commerce (ID 12)
INSERT INTO nodes (id, title, node_type, level, description, duration, icon) VALUES 
(121, 'B.Com', 'option', 3, 'Bachelor of Commerce', '3 Years', '💼'),
(122, 'BBA', 'option', 3, 'Business Admin', '3 Years', '👔'),
(123, 'B.Com (Hons)', 'option', 3, 'Specialized Commerce', '3 Years', '🎓'),
(124, 'Economics', 'option', 3, 'BA/B.Sc Economics', '3 Years', '📈'),
(125, 'Hotel Mgmt', 'option', 3, 'BHM', '4 Years', '🏨'),
(126, 'Actuarial', 'option', 3, 'Actuarial Science', '3-4 Years', '📊');

-- Path 4: Arts (ID 13)
INSERT INTO nodes (id, title, node_type, level, description, duration, icon) VALUES 
(131, 'B.A.', 'option', 3, 'Bachelor of Arts', '3 Years', '📚'),
(132, 'Mass Comm', 'option', 3, 'Journalism & Media', '3 Years', '📺'),
(133, 'Fine Arts', 'option', 3, 'BFA', '3-4 Years', '🎨'),
(134, 'Fashion Design', 'option', 3, 'B.Des', '4 Years', '👗'),
(135, 'Law', 'option', 3, 'BA LLB', '5 Years', '⚖️'),
(136, 'Social Work', 'option', 3, 'BSW', '3 Years', '🤝');

-- Path 5: Science (ID 14)
INSERT INTO nodes (id, title, node_type, level, description, duration, icon) VALUES 
(141, 'B.Sc', 'option', 3, 'Bachelor of Science', '3 Years', '🧪'),
(142, 'Integrated M.Sc', 'option', 3, 'B.Sc + M.Sc', '5 Years', '🔬');

-- Path 6: Design (ID 15)
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(151, 'Animation & VFX', 'option', 3, 'Visual Effects', '🎬'),
(152, 'Graphic Design', 'option', 3, 'Visual Comm', '✒️'),
(153, 'Product Design', 'option', 3, 'Industrial Design', '💡'),
(154, 'Interior Design', 'option', 3, 'Space Planning', '🏠');

-- Path 7: Aviation (ID 16)
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(161, 'Pilot Training', 'option', 3, 'CPL', '✈️'),
(162, 'AME', 'option', 3, 'Aircraft Maint.', '🛠️'),
(163, 'Airport Mgmt', 'option', 3, 'Ground Ops', '🏢'),
(164, 'Cabin Crew', 'option', 3, 'Air Hostess', '💁‍♀️');

-- Path 8: Defense (ID 17)
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(171, 'NDA', 'option', 3, 'National Defence Acad', '🎖️'),
(172, 'Merchant Navy', 'option', 3, 'Maritime', '🚢'),
(173, 'Police', 'option', 3, 'IPS/State', '👮'),
(174, 'Paramilitary', 'option', 3, 'BSF/CRPF', '🛡️');

-- Path 9: Agriculture (ID 18)
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(181, 'B.Sc Agriculture', 'option', 3, 'Farming Science', '🌾'),
(182, 'Food Tech', 'option', 3, 'Food Science', '🍱'),
(183, 'Horticulture', 'option', 3, 'Plant Cultivation', '🌻'),
(184, 'Dairy Tech', 'option', 3, 'Milk Production', '🥛');

-- Path 10: Skill/Vocational (ID 19)
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(191, 'Digital Mktg', 'option', 3, 'Online Marketing', '📱'),
(192, 'Photography', 'option', 3, 'Visual Arts', '📷'),
(193, 'Music/Arts', 'option', 3, 'Performing Arts', '🎭'),
(194, 'Culinary', 'option', 3, 'Cooking', '👨‍🍳'),
(195, 'Fitness', 'option', 3, 'Sports & Health', '💪');

-- Path 11: Govt Jobs (ID 20)
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(201, 'Banking Exams', 'option', 3, 'PO/Clerk', '🏦'),
(202, 'Railway Exams', 'option', 3, 'RRB', '🚂'),
(203, 'SSC', 'option', 3, 'Staff Selection', '📝');


-- ============================================
-- LEVEL 4: SPECIALIZATIONS / BRANCHES (Children of Options)
-- ============================================

-- B.Tech (101) Branches
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(1010, 'CSE', 'option', 4, 'Computer Science', '💻'),
(1011, 'IT', 'option', 4, 'Information Tech', '⚡'),
(1012, 'ECE', 'option', 4, 'Electronics & Comm', '📡'),
(1013, 'Mechanical', 'option', 4, 'Machines & Dynamics', '⚙️'),
(1014, 'Civil', 'option', 4, 'Infrastructure', '🏗️'),
(1015, 'Electrical', 'option', 4, 'Power Systems', '💡'),
(1016, 'Chemical', 'option', 4, 'Industrial Proc', '🧪'),
(1017, 'Aerospace', 'option', 4, 'Aircraft & Space', '🚀');

-- B.Com (121) Specializations
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(1210, 'CA', 'option', 4, 'Chartered Acct', '📉'),
(1211, 'CS', 'option', 4, 'Company Sec', '📜'),
(1212, 'CMA', 'option', 4, 'Cost Mgmt Acct', '💰'),
(1213, 'MBA Path', 'option', 4, 'After Graduation', '🎓');

-- B.A (131) Specializations
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(1310, 'Psychology', 'option', 4, 'Mind & Behavior', '🧠'),
(1311, 'English', 'option', 4, 'Literature', '📖'),
(1312, 'History', 'option', 4, 'Past & Culture', '🏺'),
(1313, 'Pol Science', 'option', 4, 'Govt & Policy', '🗳️'),
(1314, 'Sociology', 'option', 4, 'Society', '👥'),
(1315, 'Economics', 'option', 4, 'Markets', '📊');

-- B.Sc (141) Specializations
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(1410, 'Physics', 'option', 4, 'Matter & Energy', '⚛️'),
(1411, 'Chemistry', 'option', 4, 'Substances', '⚗️'),
(1412, 'Maths', 'option', 4, 'Numbers & Logic', '📐'),
(1413, 'Comp Sci', 'option', 4, 'Information', '🖥️'),
(1414, 'Biotech', 'option', 4, 'Biology + Tech', '🧬');

-- ============================================
-- LEVEL 5: OUTCOMES (Children of Specializations or Options)
-- ============================================

-- CSE (1010) Outcomes
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(10100, 'Software Dev', 'outcome', 5, 'Build Applications', '👨‍💻'),
(10101, 'Data Engineer', 'outcome', 5, 'Big Data Systems', '📊'),
(10102, 'AI/ML Engineer', 'outcome', 5, 'Artificial Intel', '🤖'),
(10103, 'Cyber Security', 'outcome', 5, 'Network Security', '🔒'),
(10104, 'Game Dev', 'outcome', 5, 'Create Games', '🎮');

-- MBBS (111) Outcomes (Direct parent is Option 111)
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(11100, 'Physician', 'outcome', 4, 'General Doctor', '🩺'),
(11101, 'Surgeon', 'outcome', 4, 'Operations', '🏥'),
(11102, 'Pediatrician', 'outcome', 4, 'Child Specialist', '👶'),
(11103, 'Cardiologist', 'outcome', 4, 'Heart Specialist', '❤️');

-- CA (1210) Outcomes
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(12100, 'Auditor', 'outcome', 5, 'Financial Audit', '📋'),
(12101, 'Tax Consultant', 'outcome', 5, 'Taxation Advice', '💸'),
(12102, 'Finance Advisor', 'outcome', 5, 'Investment Help', '🤝');

-- NDA (171) Outcomes
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(17100, 'Army Officer', 'outcome', 4, 'Land Defense', '🎖️'),
(17101, 'Navy Officer', 'outcome', 4, 'Sea Defense', '⚓'),
(17102, 'Air Force', 'outcome', 4, 'Air Defense', '✈️');

-- Pilot (161) Outcomes
INSERT INTO nodes (id, title, node_type, level, description, icon) VALUES 
(16100, 'Airline Pilot', 'outcome', 4, 'Fly Commercial', '🧑‍✈️'),
(16101, 'Cargo Pilot', 'outcome', 4, 'Fly Transport', '📦');

-- ============================================
-- EDGES (Defining the Tree Structure)
-- ============================================
INSERT INTO edges (parent_node_id, child_node_id, order_index) VALUES 
-- Roots to Main
(1, 10, 1), (1, 11, 2), (1, 12, 3), (1, 13, 4), (1, 14, 5),
(1, 15, 6), (1, 16, 7), (1, 17, 8), (1, 18, 9), (1, 19, 10), (1, 20, 11),

-- Engineering -> Options
(10, 101, 1), (10, 102, 2), (10, 103, 3), (10, 104, 4), (10, 105, 5),

-- B.Tech -> Branches
(101, 1010, 1), (101, 1011, 2), (101, 1012, 3), (101, 1013, 4), (101, 1014, 5), (101, 1015, 6), (101, 1016, 7), (101, 1017, 8),

-- Medical -> Options
(11, 111, 1), (11, 112, 2), (11, 113, 3), (11, 114, 4), (11, 115, 5), (11, 116, 6), (11, 117, 7), (11, 118, 8), (11, 119, 9),

-- Commerce -> Options
(12, 121, 1), (12, 122, 2), (12, 123, 3), (12, 124, 4), (12, 125, 5), (12, 126, 6),

-- B.Com -> Specializations
(121, 1210, 1), (121, 1211, 2), (121, 1212, 3), (121, 1213, 4),

-- Arts -> Options
(13, 131, 1), (13, 132, 2), (13, 133, 3), (13, 134, 4), (13, 135, 5), (13, 136, 6),

-- B.A. -> Specializations
(131, 1310, 1), (131, 1311, 2), (131, 1312, 3), (131, 1313, 4), (131, 1314, 5), (131, 1315, 6),

-- Science -> Options
(14, 141, 1), (14, 142, 2),

-- B.Sc -> Specializations
(141, 1410, 1), (141, 1411, 2), (141, 1412, 3), (141, 1413, 4), (141, 1414, 5),

-- Design -> Options
(15, 151, 1), (15, 152, 2), (15, 153, 3), (15, 154, 4),

-- Aviation -> Options
(16, 161, 1), (16, 162, 2), (16, 163, 3), (16, 164, 4),

-- Defense -> Options
(17, 171, 1), (17, 172, 2), (17, 173, 3), (17, 174, 4),

-- Agriculture -> Options
(18, 181, 1), (18, 182, 2), (18, 183, 3), (18, 184, 4),

-- Skill -> Options
(19, 191, 1), (19, 192, 2), (19, 193, 3), (19, 194, 4), (19, 195, 5),

-- Govt -> Options
(20, 201, 1), (20, 202, 2), (20, 203, 3),


-- OUTCOME CONNECTIONS
-- CSE to Outcomes
(1010, 10100, 1), (1010, 10101, 2), (1010, 10102, 3), (1010, 10103, 4), (1010, 10104, 5),

-- MBBS to Outcomes
(111, 11100, 1), (111, 11101, 2), (111, 11102, 3), (111, 11103, 4),

-- CA to Outcomes
(1210, 12100, 1), (1210, 12101, 2), (1210, 12102, 3),

-- NDA to Outcomes
(171, 17100, 1), (171, 17101, 2), (171, 17102, 3),

-- Pilot to Outcomes
(161, 16100, 1), (161, 16101, 2);


-- ============================================
-- TREE NODES MAPPING (Linking all nodes to tree)
-- ============================================
INSERT INTO tree_nodes (tree_id, node_id, is_root)
SELECT 1, id, CASE WHEN id IN (1, 100, 200, 300) THEN true ELSE false END
FROM nodes;
