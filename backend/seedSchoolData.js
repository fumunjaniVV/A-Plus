const bcrypt = require('bcrypt');
const pool = require('./config/db');

const TEACHER_PASSWORD = 'Teacher123';
const STUDENT_PASSWORD = 'Student123';
const ACADEMIC_YEAR_ID = 1;

const targetClasses = [
    { class_name: 'Grade 8A', grade: 8, stream: null },
    { class_name: 'Grade 9A', grade: 9, stream: null },
    { class_name: 'Grade 10 Science', grade: 10, stream: 'Science' },
    { class_name: 'Grade 10 Accounting', grade: 10, stream: 'Accounting' },
    { class_name: 'Grade 10 Humanities', grade: 10, stream: 'Humanities' },
    { class_name: 'Grade 11 Science', grade: 11, stream: 'Science' },
    { class_name: 'Grade 11 Accounting', grade: 11, stream: 'Accounting' },
    { class_name: 'Grade 11 Humanities', grade: 11, stream: 'Humanities' },
    { class_name: 'Grade 12 Science', grade: 12, stream: 'Science' },
    { class_name: 'Grade 12 Accounting', grade: 12, stream: 'Accounting' },
    { class_name: 'Grade 12 Humanities', grade: 12, stream: 'Humanities' },
];

const classRenames = {
    'Grade 10A': 'Grade 10 Science',
    'Grade 11A': 'Grade 11 Science',
    'Grade 12A': 'Grade 12 Science',
};

const newSubjects = [
    { subject_code: 'TOU', subject_name: 'Tourism' },
    { subject_code: 'MLI', subject_name: 'Mathematical Literacy' },
];

const classSubjectMap = {
    'Grade 8A': ['ENG', 'LIF', 'MAT', 'SCI', 'HIS', 'GEO', 'CAT', 'TOU'],
    'Grade 9A': ['ENG', 'LIF', 'MAT', 'SCI', 'HIS', 'GEO', 'CAT', 'TOU'],
    'Grade 10 Science': ['ENG', 'LIF', 'MAT', 'PHY', 'LSC', 'AGR', 'CAT', 'GEO'],
    'Grade 11 Science': ['ENG', 'LIF', 'MAT', 'PHY', 'LSC', 'AGR', 'CAT', 'GEO'],
    'Grade 12 Science': ['ENG', 'LIF', 'MAT', 'PHY', 'LSC', 'AGR', 'CAT', 'GEO'],
    'Grade 10 Accounting': ['ENG', 'LIF', 'MAT', 'ACC', 'BUS', 'ECO', 'CAT', 'TOU'],
    'Grade 11 Accounting': ['ENG', 'LIF', 'MAT', 'ACC', 'BUS', 'ECO', 'CAT', 'TOU'],
    'Grade 12 Accounting': ['ENG', 'LIF', 'MAT', 'ACC', 'BUS', 'ECO', 'CAT', 'TOU'],
    'Grade 10 Humanities': ['ENG', 'LIF', 'MLI', 'HIS', 'GEO', 'BUS', 'LSC', 'TOU'],
    'Grade 11 Humanities': ['ENG', 'LIF', 'MLI', 'HIS', 'GEO', 'BUS', 'LSC', 'TOU'],
    'Grade 12 Humanities': ['ENG', 'LIF', 'MLI', 'HIS', 'GEO', 'BUS', 'LSC', 'TOU'],
};

const subjectTeacherOptions = {
    ENG: ['teacher2', 'teacher15'],
    LIF: ['teacher13'],
    MAT: ['teacher1', 'teacher14'],
    SCI: ['teacher3'],
    HIS: ['teacher4'],
    GEO: ['teacher5'],
    CAT: ['teacher7'],
    TOU: ['teacher4', 'teacher6'],
    PHY: ['teacher8'],
    LSC: ['teacher12', 'teacher3'],
    AGR: ['teacher11'],
    ACC: ['teacher9'],
    BUS: ['teacher6', 'teacher10'],
    ECO: ['teacher10'],
    MLI: ['teacher14'],
};

const newTeachers = [
    { username: 'teacher3', full_name: 'Thabo Nkosi', department: 'Natural Sciences', phone_number: '0831000003' },
    { username: 'teacher4', full_name: 'Palesa Mokoena', department: 'History', phone_number: '0831000004' },
    { username: 'teacher5', full_name: 'Bongani Dlamini', department: 'Geography', phone_number: '0831000005' },
    { username: 'teacher6', full_name: 'Nomvula Khumalo', department: 'Business Studies', phone_number: '0831000006' },
    { username: 'teacher7', full_name: 'Sipho Mahlangu', department: 'Computer Applications Technology', phone_number: '0831000007' },
    { username: 'teacher8', full_name: 'Zanele Ndlovu', department: 'Physical Sciences', phone_number: '0831000008' },
    { username: 'teacher9', full_name: 'Lerato Sithole', department: 'Accounting', phone_number: '0831000009' },
    { username: 'teacher10', full_name: 'Kagiso Molefe', department: 'Economics', phone_number: '0831000010' },
    { username: 'teacher11', full_name: 'Nokuthula Zulu', department: 'Agricultural Sciences', phone_number: '0831000011' },
    { username: 'teacher12', full_name: 'Tumelo Radebe', department: 'Life Sciences', phone_number: '0831000012' },
    { username: 'teacher13', full_name: 'Precious Mthembu', department: 'Life Orientation', phone_number: '0831000013' },
    { username: 'teacher14', full_name: 'Andile Shabangu', department: 'Mathematics', phone_number: '0831000014' },
    { username: 'teacher15', full_name: 'Refilwe Motaung', department: 'English', phone_number: '0831000015' },
];

const maleFirstNames = ['Lwazi', 'Sibusiso', 'Mpho', 'Karabo', 'Tshepo', 'Bandile', 'Lindokuhle', 'Siyabonga', 'Katlego', 'Ayanda', 'Thabiso', 'Oratile', 'Mandla', 'Onthatile', 'Tumisang'];
const femaleFirstNames = ['Naledi', 'Amahle', 'Palesa', 'Boitumelo', 'Thandiwe', 'Lerato', 'Rethabile', 'Nomsa', 'Ayesha', 'Zinhle', 'Kefilwe', 'Reitumetse', 'Dineo', 'Khanyisile', 'Nonhlanhla'];
const lastNames = ['Mokoena', 'Nkosi', 'Dlamini', 'Khumalo', 'Ndlovu', 'Sithole', 'Molefe', 'Zulu', 'Radebe', 'Mthembu', 'Shabangu', 'Motaung', 'Mahlangu', 'Tshabalala', 'Mabaso', 'Nxumalo', 'Cele', 'Mnguni', 'Buthelezi', 'Ngwenya'];

function generateStudent(counter, grade) {
    const isMale = counter % 2 === 0;
    const firstName = isMale
        ? maleFirstNames[Math.floor(counter / 2) % maleFirstNames.length]
        : femaleFirstNames[Math.floor(counter / 2) % femaleFirstNames.length];
    const lastName = lastNames[counter % lastNames.length];
    const birthYear = 2026 - (grade + 6);
    const month = String((counter % 12) + 1).padStart(2, '0');
    const day = String((counter % 28) + 1).padStart(2, '0');

    return {
        first_name: firstName,
        last_name: lastName,
        gender: isMale ? 'Male' : 'Female',
        date_of_birth: `${birthYear}-${month}-${day}`,
    };
}

async function seed() {
    try {

        await pool.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS stream VARCHAR(20)`);
        console.log('Confirmed classes.stream column exists.');

        for (const subject of newSubjects) {

            const exists = await pool.query(
                'SELECT subject_id FROM subjects WHERE subject_code = $1',
                [subject.subject_code]
            );

            if (exists.rows.length === 0) {
                await pool.query(
                    'INSERT INTO subjects (subject_code, subject_name) VALUES ($1, $2)',
                    [subject.subject_code, subject.subject_name]
                );
                console.log(`Added subject ${subject.subject_code} (${subject.subject_name})`);
            }
        }

        for (const [oldName, newName] of Object.entries(classRenames)) {

            const target = targetClasses.find((c) => c.class_name === newName);

            await pool.query(
                `UPDATE classes SET class_name = $1, stream = $2 WHERE class_name = $3`,
                [newName, target.stream, oldName]
            );
        }

        for (const cls of targetClasses) {

            const exists = await pool.query(
                'SELECT class_id FROM classes WHERE class_name = $1',
                [cls.class_name]
            );

            if (exists.rows.length === 0) {
                await pool.query(
                    `INSERT INTO classes (class_name, grade, academic_year_id, stream)
                     VALUES ($1, $2, $3, $4)`,
                    [cls.class_name, cls.grade, ACADEMIC_YEAR_ID, cls.stream]
                );
                console.log(`Created class ${cls.class_name}`);
            }
        }

        const classRows = await pool.query('SELECT class_id, class_name, grade FROM classes');
        const classIdByName = {};
        classRows.rows.forEach((row) => {
            classIdByName[row.class_name] = row.class_id;
        });

        const subjectRows = await pool.query('SELECT subject_id, subject_code FROM subjects');
        const subjectIdByCode = {};
        subjectRows.rows.forEach((row) => {
            subjectIdByCode[row.subject_code] = row.subject_id;
        });

        const teacherIdByUsername = {};

        const existingTeachers = await pool.query(
            `SELECT t.teacher_id, u.username
             FROM teachers t
             JOIN users u ON u.user_id = t.user_id`
        );
        existingTeachers.rows.forEach((row) => {
            teacherIdByUsername[row.username] = row.teacher_id;
        });

        const teacherHash = await bcrypt.hash(TEACHER_PASSWORD, 10);

        for (const teacher of newTeachers) {

            if (teacherIdByUsername[teacher.username]) {
                continue;
            }

            const email = teacher.full_name.toLowerCase().replace(/\s+/g, '.') + '@aplus.com';

            const userResult = await pool.query(
                `INSERT INTO users (username, password_hash, full_name, email, role)
                 VALUES ($1, $2, $3, $4, 'Teacher')
                 RETURNING user_id`,
                [teacher.username, teacherHash, teacher.full_name, email]
            );

            const teacherResult = await pool.query(
                `INSERT INTO teachers (user_id, department, phone_number)
                 VALUES ($1, $2, $3)
                 RETURNING teacher_id`,
                [userResult.rows[0].user_id, teacher.department, teacher.phone_number]
            );

            teacherIdByUsername[teacher.username] = teacherResult.rows[0].teacher_id;

            console.log(`Created ${teacher.username} (${teacher.full_name})`);
        }

        const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);

        const maxAdmissionResult = await pool.query(
            `SELECT COALESCE(MAX(CAST(SUBSTRING(admission_number FROM 2) AS INTEGER)), 0) AS max_num
             FROM students`
        );
        let admissionCounter = maxAdmissionResult.rows[0].max_num + 1;

        for (const cls of targetClasses) {

            const classId = classIdByName[cls.class_name];

            const countResult = await pool.query(
                'SELECT COUNT(*) FROM students WHERE class_id = $1',
                [classId]
            );
            const currentCount = parseInt(countResult.rows[0].count, 10);
            const needed = 15 - currentCount;

            if (needed <= 0) {
                continue;
            }

            for (let i = 0; i < needed; i++) {

                const admissionNumber = `A${String(admissionCounter).padStart(3, '0')}`;
                const info = generateStudent(admissionCounter, cls.grade);
                const email = `${admissionNumber}@aplus.com`.toLowerCase();
                admissionCounter++;

                const userResult = await pool.query(
                    `INSERT INTO users (username, password_hash, full_name, email, role)
                     VALUES ($1, $2, $3, $4, 'Student')
                     RETURNING user_id`,
                    [admissionNumber, studentHash, `${info.first_name} ${info.last_name}`, email]
                );

                await pool.query(
                    `INSERT INTO students
                        (admission_number, first_name, last_name, gender, date_of_birth, class_id, status, user_id)
                     VALUES ($1, $2, $3, $4, $5, $6, 'Active', $7)`,
                    [
                        admissionNumber,
                        info.first_name,
                        info.last_name,
                        info.gender,
                        info.date_of_birth,
                        classId,
                        userResult.rows[0].user_id,
                    ]
                );
            }

            console.log(`${cls.class_name}: added ${needed} students (now 15).`);
        }

        let created = 0;
        let skipped = 0;

        const classNames = Object.keys(classSubjectMap);

        for (let classIndex = 0; classIndex < classNames.length; classIndex++) {

            const className = classNames[classIndex];
            const classId = classIdByName[className];
            const subjectCodes = classSubjectMap[className];

            for (const subjectCode of subjectCodes) {

                const subjectId = subjectIdByCode[subjectCode];
                const options = subjectTeacherOptions[subjectCode];
                const username = options[classIndex % options.length];
                const teacherId = teacherIdByUsername[username];

                const existingAssignment = await pool.query(
                    `SELECT assignment_id FROM class_assignments
                     WHERE class_id = $1 AND subject_id = $2 AND academic_year_id = $3`,
                    [classId, subjectId, ACADEMIC_YEAR_ID]
                );

                if (existingAssignment.rows.length > 0) {
                    skipped++;
                    continue;
                }

                await pool.query(
                    `INSERT INTO class_assignments (teacher_id, class_id, subject_id, academic_year_id)
                     VALUES ($1, $2, $3, $4)`,
                    [teacherId, classId, subjectId, ACADEMIC_YEAR_ID]
                );

                created++;
            }
        }

        console.log(`Class assignments: ${created} created, ${skipped} already existed.`);
        console.log('Done.');

    } catch (error) {
        console.error('Seeding error:', error.message);

    } finally {
        await pool.end();
    }
}

seed();