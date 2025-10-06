const announcements = [
  {
    title: "Lorem Ipsum",
    date: "2025-01-01",
    message: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
    bgColor: "bg-blue-100",
  },
  {
    title: "Lorem Ipsum",
    date: "2025-01-10",
    message: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
    bgColor: "bg-purple-100",
  },
  {
    title: "Lorem Ipsum",
    date: "2025-01-20",
    message: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
    bgColor: "bg-yellow-100",
  },
];
const Announcement = () => {
  return (
    <div className="bg-white p-4 rounded-md mt-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400 cursor-pointer hover:underline">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements.map((announcement, index) => (
          <div
            key={index}
            className={`${announcement.bgColor} flex flex-col p-4 rounded-md`}
          >
            <div className="flex justify-between items-center">
              <h1 className="font-medium">{announcement.title}</h1>
              <span className="bg-white rounded-md text-gray-400 p-1 text-xs">
                {announcement.date}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{announcement.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcement;
