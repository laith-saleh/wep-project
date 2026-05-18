import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // تحتاج تضيف react-router-dom لمشروعك!

const API = "http://localhost:3001";
const STUDENT_ID = 4;
const SECTIONS = [
  { key: "welcome", label: "Welcome" },
  { key: "overview", label: "Overview" },
  { key: "courses", label: "My Courses" },
  { key: "lectures", label: "My Lectures" },
  { key: "quizzes", label: "My Quizzes" },
  { key: "profile", label: "Profile" },
];

export default function StudentDashboard() {
  const [section, setSection] = useState("welcome");
  const [profile, setProfile] = useState({});
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadEnrollments();
    loadCourses();
    loadLectures();
    loadQuizzes();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/users/${STUDENT_ID}`);
      setProfile(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadEnrollments = async () => {
    try {
      const { data } = await axios.get(`${API}/enrollments?studentId=${STUDENT_ID}`);
      setEnrollments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCourses = async () => {
    try {
      const { data } = await axios.get(`${API}/courses`);
      setCourses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLectures = async () => {
    try {
      const { data } = await axios.get(`${API}/lectures`);
      setLectures(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuizzes = async () => {
    try {
      const { data } = await axios.get(`${API}/quizzes`);
      setQuizzes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const enrolledCourses = enrollments
    .map((enroll) => {
      const course = courses.find((c) => String(c.id) === String(enroll.courseId));
      if (!course) return null;
      return { ...course, progress: enroll.progress };
    })
    .filter(Boolean);

  const selectedLectures = selectedCourse
    ? lectures.filter((lec) => String(lec.courseId) === String(selectedCourse.id))
    : [];

  const selectedQuizzes = selectedCourse
    ? quizzes.filter((quiz) => String(quiz.courseId) === String(selectedCourse.id))
    : [];

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gradient-to-b from-purple-700 to-indigo-600 text-white shadow-lg">
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold">Student</h1>
          <p className="mt-1 text-sm opacity-75">
            {profile.name ? `Welcome, ${profile.name}!` : "Welcome!"}
          </p>
        </div>
        <nav className="px-2 mt-4">
          {SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() => {
                setSection(sec.key);
                setSelectedCourse(null); // تفريغ الكورس المحدد عند تغيير القسم
              }}
              className={`block w-full text-left px-4 py-2 my-1 rounded transition-all duration-200 ${
                section === sec.key ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            {SECTIONS.find((s) => s.key === section)?.label || ""}
          </h2>
          <button
            onClick={() => {
              loadProfile();
              loadEnrollments();
              loadCourses();
              loadLectures();
              loadQuizzes();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow"
          >
            Refresh
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6 flex gap-6">
          {/* Content Section */}
          {section === "welcome" && (
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-indigo-700 mb-4">Welcome to Your Student Dashboard!</h1>
              <p className="text-lg text-gray-700 mb-6">
                Here you can track your courses, lectures, quizzes, and your profile details easily.
                Use the menu on the left to navigate through your dashboard.
              </p>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3448/3448442.png"
                alt="Welcome illustration"
                className="mx-auto w-48 h-48 opacity-80"
              />
            </div>
          )}

          {section === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {/* البطاقات مع ارتفاع أقصر */}
              <StatCard label="Courses Enrolled" value={enrolledCourses.length} shortHeight />
              <StatCard
                label="Lectures Available"
                value={lectures.filter((l) => enrolledCourses.some((c) => String(c.id) === String(l.courseId))).length}
                shortHeight
              />
              <StatCard
                label="Quizzes Available"
                value={quizzes.filter((q) => enrolledCourses.some((c) => String(c.id) === String(q.courseId))).length}
                shortHeight
              />
              <StatCard label="Average Progress" value={`${averageProgress(enrollments)}%`} shortHeight />
            </div>
          )}

          {section === "courses" && (
            <div className="flex w-full max-w-6xl mx-auto gap-6">
              {/* قائمة الكورسات */}
              <div className="w-1/2 space-y-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">My Courses</h3>
                {enrolledCourses.length === 0 ? (
                  <p className="text-gray-500">You are not enrolled in any courses.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto">
                    {enrolledCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className={`p-4 rounded-xl shadow cursor-pointer transition ${
                          selectedCourse?.id === course.id
                            ? "bg-indigo-100 shadow-indigo-400"
                            : "bg-white hover:shadow-md"
                        }`}
                      >
                        {/* لون النص داكن */}
                        <h4 className="text-lg font-bold text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-700">{course.description || "No description available."}</p>
                        <p className="mt-2 text-sm text-indigo-700 font-semibold">Progress: {course.progress}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* تفاصيل الكورس المحدد */}
              <div className="w-1/2 bg-white rounded-xl shadow p-6 max-h-[600px] overflow-y-auto">
                {selectedCourse ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4">{selectedCourse.title}</h3>
                    <p className="mb-4 text-gray-600">{selectedCourse.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2">Lectures</h4>
                      {selectedLectures.length === 0 ? (
                        <p className="text-gray-500 mb-4">No lectures available.</p>
                      ) : (
                        <ul className="mb-4 list-disc list-inside">
                          {selectedLectures.map((lec) => (
                            <li key={lec.id}>
                              {lec.title} ({lec.type})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Quizzes</h4>
                      {selectedQuizzes.length === 0 ? (
                        <p className="text-gray-500">No quizzes available.</p>
                      ) : (
                        <ul className="list-disc list-inside">
                          {selectedQuizzes.map((quiz) => (
                            <li key={quiz.id}>
                              {quiz.title || "Quiz"} — {quiz.questions?.length || 0} questions
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center mt-20">Select a course to see its details here.</p>
                )}
              </div>
            </div>
          )}

          {/* هنا التعديل في قسم المحاضرات */}
          {section === "lectures" && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">My Lectures</h3>
              {lectures.length === 0 ? (
                <p className="text-gray-500">No lectures available.</p>
              ) : (
                <ul className="space-y-2">
                  {lectures
                    .filter((lec) => enrolledCourses.some((course) => String(course.id) === String(lec.courseId)))
                    .map((lec) => (
                      <li
                        key={lec.id}
                        className="p-3 bg-white rounded shadow cursor-pointer hover:shadow-md"
                      >
                        <a
                          href={lec.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 font-semibold hover:underline"
                        >
                          {lec.title}
                        </a>{" "}
                        <span className="text-gray-600">({lec.type})</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}

          {section === "quizzes" && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">My Quizzes</h3>
              {quizzes.length === 0 ? (
                <p className="text-gray-500">No quizzes available.</p>
              ) : (
                <ul className="space-y-2">
                  {quizzes
                    .filter((quiz) => enrolledCourses.some((course) => String(course.id) === String(quiz.courseId)))
                    .map((quiz) => (
                      <li
                        key={quiz.id}
                        className="p-3 bg-white rounded shadow cursor-pointer hover:shadow-md text-gray-900"
                      >
                        <strong>{quiz.title || "Quiz"}</strong> — {quiz.questions?.length || 0} questions
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}

          {section === "profile" && (
            <div className="space-y-4 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile</h3>
              <div className="p-4 bg-white rounded shadow text-gray-900">
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Username:</strong> {profile.username || "N/A"}
                </p>
                <p>
                  <strong>Role:</strong> {profile.role}
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold shadow"
              >
                Logout
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// مكون لبطاقات الإحصائيات مع دعم ارتفاع أقصر
function StatCard({ label, value, shortHeight }) {
  return (
    <div
      className={`p-6 bg-white rounded-xl shadow hover:shadow-md cursor-pointer transition max-w-xs mx-auto text-center ${
        shortHeight ? "h-28" : ""
      }`}
      style={{ minHeight: shortHeight ? "7rem" : "auto" }}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-indigo-700">{value}</p>
    </div>
  );
}

// حساب متوسط التقدم للدورات
function averageProgress(enrollments) {
  if (enrollments.length === 0) return 0;
  const total = enrollments.reduce((sum, e) => sum + e.progress, 0);
  return Math.round(total / enrollments.length);
}
