// src/InstructorDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001";
const INSTRUCTOR_ID = 2;
const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "courses", label: "My Courses" },
  { key: "content", label: "Manage Content" },
  { key: "students", label: "Student Progress" },
  { key: "profile", label: "Profile" },
];

export default function InstructorDashboard() {
  const [section, setSection] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [allLectures, setAllLectures] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalType, setModalType] = useState("add");
  const [modalEntity, setModalEntity] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadCourses();
    loadUsers();
    loadAllLectures();
    loadAllQuizzes();
    loadAllEnrollments();
  }, []);

  const loadProfile = async () => {
    const { data } = await axios.get(`${API}/users/${INSTRUCTOR_ID}`);
    setProfile(data);
  };

  const loadCourses = async () => {
    setLoading(true);
    const { data } = await axios.get(`${API}/courses?instructorId=${INSTRUCTOR_ID}`);
    setCourses(data);
    setLoading(false);
  };

  const loadDetails = async (courseId) => {
    setLoading(true);
    const [l, q, e] = await Promise.all([
      axios.get(`${API}/lectures?courseId=${courseId}`),
      axios.get(`${API}/quizzes?courseId=${courseId}`),
      axios.get(`${API}/enrollments?courseId=${courseId}`),
    ]);
    setLectures(l.data);
    setQuizzes(q.data);
    setEnrollments(e.data);
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data } = await axios.get(`${API}/users`);
    setUsers(data);
  };

  const loadAllLectures = async () => {
    const { data } = await axios.get(`${API}/lectures`);
    setAllLectures(data);
  };

  const loadAllQuizzes = async () => {
    const { data } = await axios.get(`${API}/quizzes`);
    setAllQuizzes(data);
  };

  const loadAllEnrollments = async () => {
    const { data } = await axios.get(`${API}/enrollments`);
    setAllEnrollments(data);
  };

  const openModal = (entity, type, data = {}) => {
    setModalEntity(entity);
    setModalType(type);
    setModalData(data);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleDelete = async (entity, id) => {
    if (!confirm("Confirm delete?")) return;
    await axios.delete(`${API}/${entity}/${id}`);
    if (entity === "courses") loadCourses();
    else loadDetails(selected.id);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const url = `${API}/${modalEntity}`;
    const payload = { ...modalData, instructorId: INSTRUCTOR_ID };
    if (modalType === "add") await axios.post(url, payload);
    else await axios.put(`${url}/${modalData.id}`, payload);
    closeModal();
    if (modalEntity === "courses") loadCourses();
    else loadDetails(selected.id);
  };

  const handleLogout = () => {
    // تنظيف بيانات الجلسة إن وجدت
    // localStorage.removeItem("token");
    // localStorage.removeItem("userData");
    navigate("/");
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gradient-to-b from-blue-700 to-green-600 text-white shadow-lg">
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold">Instructor</h1>
        </div>
        <nav className="px-2 mt-4">
          {SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() => {
                setSection(sec.key);
                if (sec.key === "content" && selected) loadDetails(selected.id);
              }}
              className={`block w-full text-left px-4 py-2 my-1 rounded transition-all duration-200 ${
                section === sec.key ? "bg-white text-blue-700 font-semibold" : "hover:bg-white/20"
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
            {SECTIONS.find((s) => s.key === section).label}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadCourses}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow"
            >
              Refresh
            </button>
            <span className="text-gray-800 font-medium">{profile.name || profile.username}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Overview Section */}
          {section === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { label: "Admins", value: users.filter((u) => u.role.toLowerCase() === "admin").length },
                { label: "Instructors", value: users.filter((u) => u.role.toLowerCase() === "instructor").length },
                { label: "Students", value: users.filter((u) => u.role.toLowerCase() === "student").length },
                { label: "Courses", value: courses.length },
                { label: "Enrollments", value: allEnrollments.length },
                { label: "Video Lectures", value: allLectures.filter((l) => l.type === "video").length },
                { label: "PDF Lectures", value: allLectures.filter((l) => l.type === "pdf").length },
                { label: "Quizzes", value: allQuizzes.length },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (card.label === "Courses") setSection("courses");
                    else if (card.label === "Quizzes" || card.label.includes("Lecture")) setSection("content");
                    else if (card.label === "Students" || card.label === "Enrollments") setSection("students");
                  }}
                  className="p-6 bg-white rounded-xl shadow hover:shadow-md transition-all cursor-pointer"
                >
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-blue-700">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Courses Section */}
          {section === "courses" && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">My Courses</h3>
                <button onClick={() => openModal("courses", "add")} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Add Course
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelected(course);
                      setSection("content");
                      loadDetails(course.id);
                    }}
                    className="p-4 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer"
                  >
                    <h4 className="text-lg font-bold">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.description}</p>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("courses", "edit", course);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("courses", course.id);
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Section */}
          {section === "content" && selected && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Manage Content for: {selected.title}</h3>

              {/* Lectures */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold">Lectures</h4>
                  <button
                    onClick={() => openModal("lectures", "add", { courseId: selected.id })}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Add Lecture
                  </button>
                </div>
                <ul className="space-y-2">
                  {lectures.map((lec) => (
                    <li key={lec.id} className="p-3 bg-white rounded shadow flex justify-between">
                      <span>
                        {lec.title} ({lec.type})
                      </span>
                      <div className="space-x-2">
                        <button onClick={() => openModal("lectures", "edit", lec)} className="text-blue-600">
                          Edit
                        </button>
                        <button onClick={() => handleDelete("lectures", lec.id)} className="text-red-600">
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quizzes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold">Quizzes</h4>
                  <button
                    onClick={() => openModal("quizzes", "add", { courseId: selected.id })}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Add Quiz
                  </button>
                </div>
                <ul className="space-y-2">
                  {quizzes.map((quiz) => (
                    <li key={quiz.id} className="p-3 bg-white rounded shadow flex justify-between">
                      <span>{quiz.title}</span>
                      <div className="space-x-2">
                        <button onClick={() => openModal("quizzes", "edit", quiz)} className="text-blue-600">
                          Edit
                        </button>
                        <button onClick={() => handleDelete("quizzes", quiz.id)} className="text-red-600">
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Students Section */}
          {section === "students" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Student Enrollments</h3>
              <ul className="space-y-2">
                {allEnrollments.map((enroll) => {
                  const student = users.find((u) => u.id === enroll.userId);
                  const course = courses.find((c) => c.id === enroll.courseId);
                  return (
                    <li key={enroll.id} className="p-3 bg-white rounded shadow">
                      <p className="text-sm">
                        <strong>{student?.name || "Unknown Student"}</strong> enrolled in{" "}
                        <strong>{course?.title || "Unknown Course"}</strong>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Profile Section */}
          {section === "profile" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
              <div className="p-4 bg-white rounded shadow text-gray-800">
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Username:</strong> {profile.username}
                </p>
                <p>
                  <strong>Role:</strong> {profile.role}
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <form
            onSubmit={handleModalSubmit}
            className="bg-white p-6 rounded-xl shadow-2xl w-96 space-y-4 animate-fadeIn"
          >
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              {modalType === "add" ? "Add" : "Edit"}{" "}
              {modalEntity.charAt(0).toUpperCase() + modalEntity.slice(1)}
            </h2>
            {Object.entries(modalData).map(([k, v]) => {
              if (k === "id" || k === "instructorId" || k === "courseId") return null;
              return (
                <div key={k}>
                  <label className="block text-sm text-gray-700 mb-1 capitalize">{k}</label>
                  <input
                    name={k}
                    value={v}
                    onChange={(e) => setModalData((md) => ({ ...md, [k]: e.target.value }))}
                    className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              );
            })}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
