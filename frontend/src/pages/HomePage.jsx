import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../assets/css/home.css";

function HomePage({ auth }) {
  const navigate = useNavigate();
  const [quickSerial, setQuickSerial] = useState("");
  const isAuthenticated = Boolean(auth?.token);

  const goSearch = () => {
    if (quickSerial) {
      navigate(`/search?serial=${quickSerial}`);
    } else {
      navigate("/search");
    }
  };

  const goPortal = () => {
    navigate("/account");
  };

  return (
    <div className="view active">
      <section className="bw-hero">
        <div className="bw-hero-inner">
          <p className="bw-badge">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Bảo hành bằng Blockchain
          </p>
          <h1 className="bw-hero-title">
            Sản phẩm của bạn, <br />
            <span className="accent">Được bảo vệ mãi mãi</span>
          </h1>
          <p className="bw-hero-lead">
            Giải pháp bảo mật toàn diện cho sản phẩm của bạn bằng cách chuyển đổi chứng nhận<br />
            bảo hành thành tài sản kỹ thuật số không thể làm giả trên Blockchain. <br />
            Dễ dàng theo dõi lịch sử sửa chữa, chuyển nhượng quyền sở hữu tức thì và <br />
            xác minh tính nguyên bản với sự minh bạch và tin cậy tuyệt đối.
          </p>
          <div className="bw-hero-cta">
            <button type="button" className="btn-hero-primary" onClick={goSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '10px' }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Tra cứu công khai
            </button>
            <button
              type="button"
              className="btn-hero-outline"
              onClick={goPortal}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '10px' }}>
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
              </svg>
              Truy cập Ví của bạn
            </button>
          </div>
        </div>
      </section>

      <section className="bw-section alt" id="welcome">
        <div className="bw-inner">
          <h2 className="bw-h2">Chào mừng đến với Tương lai của Bảo hành</h2>
          <p className="bw-sub">
            E-Warranty cách mạng hóa việc cấp, quản lý và chuyển nhượng bảo hành.<br />
            Tạm biệt hóa đơn giấy dễ mất và các khiếu nại giả mạo.
          </p>
          <div className="bw-feature-row">
            <article className="bw-feature-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Chống làm giả</h4>
              <p>Mọi thông tin bảo hành được lưu trên blockchain, không thể giả mạo, thay đổi hoặc làm mất.</p>
            </article>
            <article className="bw-feature-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 0115 15" />
                </svg>
              </div>
              <h4>Truy cập Toàn cầu</h4>
              <p>Truy cập thông tin bảo hành của bạn <br /> ở bất cứ đâu, bất cứ lúc nào chỉ với <br /> kết nối internet.</p>
            </article>
            <article className="bw-feature-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h4>Chuyển nhượng Tức thì</h4>
              <p>Chuyển giao quyền bảo hành cho <br /> chủ sở hữu mới ngay lập tức <br /> khi bán lại sản phẩm.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bw-section" id="how">
        <div className="bw-inner">
          <h2 className="bw-h2">Cách thức Hoạt động</h2>
          <p className="bw-sub">Ba bước đơn giản để bảo mật sản phẩm của bạn với công nghệ blockchain.</p>
          <div className="bw-steps">
            <article className="bw-step-card">
              <div className="bw-step-num">1</div>
              <h4>Mua Sản phẩm</h4>
              <p>Mua hàng từ các đại lý và nhà sản xuất <br /> có liên kết với hệ thống.</p>
            </article>
            <article className="bw-step-card">
              <div className="bw-step-num">2</div>
              <h4>Nhận Bảo hành NFT</h4>
              <p>Một chứng nhận bảo hành kỹ thuật số <br /> duy nhất sẽ được gửi vào ví của bạn.</p>
            </article>
            <article className="bw-step-card">
              <div className="bw-step-num">3</div>
              <h4>Quản lý & Chuyển giao</h4>
              <p>Theo dõi sửa chữa, yêu cầu bảo hành <br /> và chuyển quyền sở hữu dễ dàng.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bw-section alt" id="trust">
        <div className="bw-inner">
          <div className="bw-trust">
            <div className="bw-trust-visual">
              <img
                src="https://www.atulhost.com/wp-content/uploads/2023/01/blockchain-wallet.jpg"
                alt="Blockchain Wallet Security"
                className="trust-image"
              />
            </div>
            <div className="bw-trust-copy">
              <h3>
                Xây dựng trên sự Tin tưởng, <br />Thúc đẩy bởi <span className="accent">Sự đổi mới</span>
              </h3>
              <p>
                E-Warranty kết hợp bảo mật blockchain cấp doanh nghiệp với <br /> trải nghiệm hiện đại,
                giúp khách hàng của bạn an tâm tuyệt đối.
              </p>
              <ul className="bw-check-list">
                <li>
                  <span className="bw-check-ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 5 12" />
                    </svg>
                  </span>
                  <div>
                    <strong>Bảo mật Cấp doanh nghiệp</strong>
                    <span>Mã hóa cấp quân đội và tính bất biến của blockchain.</span>
                  </div>
                </li>
                <li>
                  <span className="bw-check-ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 5 12" />
                    </svg>
                  </span>
                  <div>
                    <strong>Giao diện Thân thiện</strong>
                    <span>Không cần kiến thức blockchain — đơn giản như một ứng dụng ví.</span>
                  </div>
                </li>
                <li>
                  <span className="bw-check-ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 5 12" />
                    </svg>
                  </span>
                  <div>
                    <strong>Hỗ trợ Khách hàng 24/7</strong>
                    <span>Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bw-section" id="why">
        <div className="bw-inner">
          <h2 className="bw-h2">Tại sao chọn E-Warranty?</h2>
          <p className="bw-sub">Tham gia cuộc cách mạng và cung cấp cho khách hàng sự bảo vệ chưa từng có.</p>
          <div className="bw-grid-6">
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <h4>Tăng Giá trị Bán lại</h4>
              <p>Sản phẩm có bảo hành chuyển nhượng có giá trị cao hơn trên thị trường thứ cấp.</p>
            </article>
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 6l-9.5 9.5-5-5L1 18" />
                  <path d="M17 6h6v6" />
                </svg>
              </div>
              <h4>Giảm thiểu Gian lận</h4>
              <p>Loại bỏ các bảo hành giả mạo bằng hồ sơ bất biến và xác minh tức thì.</p>
            </article>
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <h4>Xác minh Tức thì</h4>
              <p>Các trung tâm dịch vụ xác minh trạng thái bảo hành ngay lập tức, giảm thời gian chờ.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bw-section alt" id="testimonials">
        <div className="bw-inner">
          <h2 className="bw-h2">Tin tưởng bởi Hàng ngàn người</h2>
          <p className="bw-sub">Xem những gì đối tác và khách hàng của chúng tôi nói về E-Warranty.</p>
          <div className="bw-testimonials">
            <blockquote className="bw-quote">
              <div className="bw-stars">★★★★★</div>
              <p>“Chúng tôi đã cắt giảm một nửa <br /> các tranh chấp bảo hành. Khách hàng <br /> rất thích quét mã QR để kiểm tra.”</p>
              <div className="bw-author">
                <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Chen" className="bw-avatar" />
                <div className="bw-author-info">
                  <strong>Sarah Chen</strong>
                  <span>Trưởng phòng Vận hành Bán lẻ</span>
                </div>
              </div>
            </blockquote>
            <blockquote className="bw-quote featured">
              <div className="bw-stars">★★★★★</div>
              <p>“Cuối cùng cũng có một sản phẩm blockchain thực tế. Việc triển khai chỉ mất một buổi chiều làm việc.”</p>
              <div className="bw-author">
                <img src="https://i.pravatar.cc/150?u=marcus" alt="Marcus Rodriguez" className="bw-avatar" />
                <div className="bw-author-info">
                  <strong>Marcus Rodriguez</strong>
                  <span>CTO, FutureTech</span>
                </div>
              </div>
            </blockquote>
            <blockquote className="bw-quote">
              <div className="bw-stars">★★★★★</div>
              <p>“Giá trị bán lại tăng lên nhờ bảo hành chuyển nhượng là một lợi thế <br /> cạnh tranh tuyệt vời cho chúng tôi.”</p>
              <div className="bw-author">
                <img src="https://i.pravatar.cc/150?u=elena" alt="Elena Volkov" className="bw-avatar" />
                <div className="bw-author-info">
                  <strong>Elena Volkov</strong>
                  <span>Quản lý Đối tác Kênh</span>
                </div>
              </div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Map & Contact Section - NEW DARK STYLE */}
      <section className="bw-section" id="location">
        <div className="bw-inner">
          <div className="bw-location-card">
            <div className="bw-location-content">
              <h2 className="bw-h2-light">
                Hệ thống Trung tâm Bảo hành
              </h2>
              <p className="bw-location-desc">
                Chúng tôi hợp tác cùng các đơn vị uy tín hàng đầu để đảm bảo <br /> chất lượng dịch vụ.
              </p>

              <div className="bw-address-box">
                <h3>Trường Đại học Công nghệ Thông tin - <br /> ĐHQG TP.HCM (UIT)</h3>
                <p className="bw-addr-text">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="bw-addr-ic">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Khu phố 34, Phường Linh Xuân, Thành phố Hồ Chí Minh.
                </p>
              </div>

              <div className="bw-contact-row">
                <div className="bw-contact-badge">
                  <strong>SĐT:</strong> (028) 372 52002
                </div>
                <div className="bw-contact-badge">
                  <strong>Email:</strong> info@uit.edu.vn
                </div>
              </div>

              <div className="bw-stats-row">
                <div className="bw-stat-item">
                  <span className="stat-num">500+</span>
                  <span className="stat-label">Điểm tiếp nhận</span>
                </div>
                <div className="bw-stat-item">
                  <span className="stat-num">24/7</span>
                  <span className="stat-label">Hỗ trợ kỹ thuật</span>
                </div>
                <div className="bw-stat-item">
                  <span className="stat-num">99%</span>
                  <span className="stat-label">Hài lòng</span>
                </div>
              </div>
            </div>

            <div className="bw-location-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.231240416692!2d106.80086541533418!3d10.870008892257916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9d8bc3c21!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgVGjDtG5nIHRpbiAtIMSQSFFHIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1714210000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="UIT Map"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
