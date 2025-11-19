import { useParams, useNavigate } from "react-router-dom";
import { useUserDetail } from "../../../hook/UserHook";
// import type { User } from "../../types/user";

export default function DetailUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useUserDetail(id ?? "");

  if (isLoading) return <p className="text-center">Đang tải...</p>;
  if (isError || !user)
    return (
      <p className="text-center text-danger">Không tìm thấy người dùng.</p>
    );

  return (
    <div className="container p-4">
      <div className="container-fluid">
        {/* Banner */}
        <div className="position-relative overflow-hidden">
          <div className="position-relative overflow-hidden rounded-3">
            <img
              src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/backgrounds/profilebg-2.jpg"
              alt="profile-bg"
              className="w-100"
            />
          </div>

          {/* Thông tin người dùng */}
          <div className="card mx-9 mt-n5">
            <div className="card-body pb-0">
              <div className="d-md-flex align-items-center justify-content-between text-center text-md-start">
                <div className="d-md-flex align-items-center">
                  <div className="rounded-circle position-relative mb-9 mb-md-0 d-inline-block">
                    <img
                      src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-1.jpg"
                      alt={user.ten}
                      className="img-fluid rounded-circle"
                      width={100}
                      height={100}
                    />
                  </div>

                  <div className="ms-0 ms-md-3 mb-9 mb-md-0">
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-1">
                      <h4 className="me-7 mb-0 fs-7">{user.ten}</h4>
                      <span className="badge fs-2 fw-bold rounded-pill bg-primary-subtle text-primary border-primary border">
                        {user.vai_tro_id}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                      <span
                        className={`p-1 rounded-circle ${
                          user.trang_thai ? "bg-success" : "bg-secondary"
                        }`}
                      ></span>
                      <h6 className="mb-0 ms-2">
                        {user.trang_thai ? "Hoạt động" : "Khóa"}
                      </h6>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-primary px-3 shadow-none"
                >
                  Quay lại
                </button>
              </div>

              <ul
                className="nav nav-pills user-profile-tab mt-4 justify-content-center justify-content-md-start"
                id="pills-tab"
                role="tablist"
              >
                <li className="nav-item me-2 me-md-3" role="presentation">
                  <button
                    className="nav-link position-relative rounded-0 active d-flex align-items-center justify-content-center bg-transparent py-6"
                    id="pills-profile-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-profile"
                    type="button"
                    role="tab"
                    aria-controls="pills-profile"
                    aria-selected="true"
                  >
                    <i className="fa-solid fa-user  me-0 me-md-6 fs-6"></i>
                    <span className="d-none d-md-block">Thông tin</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Nội dung tab */}
        <div className="tab-content mx-10" id="pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="pills-profile"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
          >
            <div className="row">
              {/* Cột trái - About */}
              <div className="col-lg-4">
                <div className="card">
                  <div className="card-body p-4">
                    <div className="py-9">
                      <div className="d-flex align-items-center mb-9">
                        <div className="bg-success-subtle text-success fs-14 round-40 rounded-circle d-flex align-items-center justify-content-center">
                          <i className="fa-solid fa-envelope"></i>
                        </div>
                        <div className="ms-6">
                          <h6 className="mb-1">Email</h6>
                          <p className="mb-0">{user.email}</p>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-9">
                        <div className="bg-success-subtle text-success fs-14 round-40 rounded-circle d-flex align-items-center justify-content-center">
                        <i className="fa-solid fa-check"></i>
                        </div>
                        <div className="ms-6">
                          <h6 className="mb-1">Xác thực email</h6>
                          <p className="mb-0">
                            {user.email_verified_at
                              ? new Date(
                                  user.email_verified_at
                                ).toLocaleDateString("vi-VN")
                              : "Chưa xác thực"}
                          </p>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-9">
                        <div className="bg-primary-subtle text-primary fs-14 round-40 rounded-circle d-flex align-items-center justify-content-center">
                          <i className="fa-solid fa-calendar"></i>
                        </div>
                        <div className="ms-6">
                          <h6 className="mb-1">Ngày tạo</h6>
                          <p className="mb-0">
                            {new Date(user.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center mb-9">
                        <div className="bg-primary-subtle text-primary fs-14 round-40 rounded-circle d-flex align-items-center justify-content-center">
                          <i className="fa-solid fa-calendar"></i>
                        </div>
                        <div className="ms-6">
                          <h6 className="mb-1">Ngày cập nhật</h6>
                          <p className="mb-0">
                            {new Date(user.updated_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải - Chi tiết */}
              <div className="col-lg-8">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary-subtle text-primary p-6 fs-7 rounded-circle d-flex align-items-center justify-content-center">
                            <i className="fa-brands fa-shopify"></i>
                          </div>
                          <div className="ms-6">
                            <h6 className="mb-1 fs-6">680</h6>
                            <p className="mb-0">Số đơn đặt vé</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-success-subtle text-success p-6 fs-7 rounded-circle d-flex align-items-center justify-content-center">
                            <i className="fa-solid fa-ranking-star"></i>
                          </div>
                          <div className="ms-6">
                            <h6 className="mb-1 fs-6">42</h6>
                            <p className="mb-0">Xếp hạng</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-danger-subtle text-danger p-6 fs-7 rounded-circle d-flex align-items-center justify-content-center">
                            <i className="fa-solid fa-comment"></i>
                          </div>
                          <div className="ms-6">
                            <h6 className="mb-1 fs-6">$780</h6>
                            <p className="mb-0">Bình luận</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body p-4">
                    <ul
                      className="nav nav-tabs nav-tabs-user-profile mb-4"
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <a
                          className="nav-link shadow-none active"
                          data-bs-toggle="tab"
                          href="#feeds"
                          role="tab"
                          aria-selected="false"
                          tabIndex={-1}
                        >
                          <span>Orders</span>
                        </a>
                      </li>
                      <li className="nav-item" role="presentation">
                        <a
                          className="nav-link shadow-none"
                          data-bs-toggle="tab"
                          href="#timeline"
                          role="tab"
                          aria-selected="false"
                          tabIndex={-1}
                        >
                          <span>Comments</span>
                        </a>
                      </li>
                    </ul>

                    <div className="tab-content">
                      <div
                        className="tab-pane active"
                        id="feeds"
                        role="tabpanel"
                      >
                        {/* Order */}
                      </div>

                      <div className="tab-pane" id="timeline" role="tabpanel">
                        {/* Comment */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
