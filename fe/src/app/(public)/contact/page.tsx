export default function Page() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-10 text-left items-start">
        {/* Cột Hình ảnh */}
        <div className="w-full lg:w-1/3">
          <div className="relative inline-block w-full rounded-xl overflow-hidden shadow-md">
            {/* Nếu dùng Next.js, bạn có thể cân nhắc đổi thẻ img thành thẻ <Image /> */}
            <img
              src="./about.jpg"
              className="w-full h-auto object-cover"
              alt="Keyboard"
            />
          </div>
        </div>

        {/* Cột Nội dung liên hệ */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-4xl font-bold mb-8">Contact us:</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Facebook Iframe */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Main Page:</h4>
              <iframe
                className="block rounded-lg shadow-sm"
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61575185811123&tabs&width=340&height=130&small_header=false&adapt_container_width=false&hide_cover=false&show_facepile=false&appId"
                width="340"
                height="130"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>

            {/* Thông tin liên hệ */}
            <div className="space-y-3 text-lg text-gray-700 flex flex-col justify-center">
              <p>
                <span className="font-semibold">Phone number:</span> 0935118607
                (Mr. Khang)
              </p>
              <p>
                <span className="font-semibold">Mail for work:</span>{" "}
                khang.nguyenleduy@hcmut.edu.vn
              </p>
              <p>
                <span className="font-semibold">Advertising Booking:</span>{" "}
                <a
                  href="https://www.facebook.com/JKhang4/"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  JKhang
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
