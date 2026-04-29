function Footer() {
  return (
    <footer className="bw-footer">
      <div className="bw-footer-grid">
        <div className="bw-footer-brand">
          <strong style={{ fontSize: '3.2rem', color: 'white', display: 'block', marginBottom: '2.5rem' }}>E-Warranty</strong>
          <p style={{ fontSize: '1.8rem', lineHeight: '1.8', maxWidth: '40rem', opacity: 0.8 }}>
            Hệ thống bảo hành kỹ thuật số an toàn, <br /> minh bạch và không thể giả mạo, vận hành <br /> trên nền tảng Blockchain tiên tiến.
          </p>
        </div>
        <div className="bw-footer-col">
          <h4>Sản phẩm</h4>
          <ul>
            <li>
              <a href="#">Tính năng</a>
            </li>
            <li>
              <a href="#">Cách hoạt động</a>
            </li>
            <li>
              <a href="#">Hệ thống trạm</a>
            </li>
          </ul>
        </div>
        <div className="bw-footer-col">
          <h4>Về chúng tôi</h4>
          <ul>
            <li>
              <a href="#">Liên hệ</a>
            </li>
            <li>
              <a href="#">Bảo mật</a>
            </li>
            <li>
              <a href="#">Đánh giá</a>
            </li>
          </ul>
        </div>
        <div className="bw-footer-col">
          <h4>Pháp lý</h4>
          <ul>
            <li>
              <a href="#">Chính sách bảo mật</a>
            </li>
            <li>
              <a href="#">Điều khoản sử dụng</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="bw-footer-bottom">
        <p>© 2026 E-Warranty. Bản quyền thuộc về Nhóm 1 môn IE213</p>
      </div>
    </footer>
  );
}

export default Footer;
