<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vai_tro', function (Blueprint $table) {
            $table->id();
            $table->string('ten_vai_tro', 50);
            $table->text('mo_ta')->nullable();
            $table->timestamps();
        });

        Schema::create('menu', function (Blueprint $table) {
            $table->id();
            $table->string('ma_chuc_nang', 250);
            $table->string('ma_cha', 250)->nullable();
            $table->string('ten_chuc_nang', 250);
            $table->text('state');
            $table->string('stt')->nullable();
            $table->boolean('trang_thai')->default(true);
            $table->timestamps();
        });


        Schema::create('quyen_truy_cap', function (Blueprint $table) {

            $table->foreignId('vai_tro_id')->constrained('vai_tro')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('menu_id')->constrained('menu')->onUpdate('cascade')->onDelete('cascade');
            $table->string('function')->nullable();
            $table->timestamps();
        });


        Schema::create('nguoi_dung', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 100);
            $table->string('email', 100)->unique();
            $table->string('so_dien_thoai', 20)->nullable();
            $table->string('password', 255);
            $table->string('anh_dai_dien', 255)->nullable();
            $table->boolean('trang_thai')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verify_token', 64)->nullable();
            $table->string('verification_code', 10)->nullable();
            $table->foreignId('vai_tro_id')->constrained('vai_tro')->onUpdate('cascade')->onDelete('cascade');
            $table->timestamps();
        });





        Schema::create('the_loai', function (Blueprint $table) {
            $table->id();
            $table->string('ten_the_loai', 100);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('phien_ban', function (Blueprint $table) {
            $table->id();
            $table->string('the_loai', 100);
            $table->timestamps();
        });

        Schema::create('phim', function (Blueprint $table) {
            $table->id();
            $table->string('ten_phim', 255);
            $table->text('mo_ta')->nullable();
            $table->integer('thoi_luong');
            $table->string('trailer', 255)->nullable();
            $table->string('ngon_ngu', 100);
            $table->string('quoc_gia', 100);
            $table->string('anh_poster', length: 255)->nullable();
            $table->date('ngay_cong_chieu');
            $table->date('ngay_ket_thuc')->nullable();
            $table->string('do_tuoi_gioi_han', 50);
            $table->enum('loai_suat_chieu', ['Thường', 'Đặc biệt', 'Sớm']);
            $table->json('phien_ban_id')->nullable();
            $table->json('the_loai_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });



        Schema::create('danh_gia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dung')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('phim_id')->constrained('phim')->onUpdate('cascade')->onDelete('cascade');
            $table->integer('so_sao');
            $table->text('noi_dung');
            $table->boolean('trang_thai')->default(true);
            $table->timestamps();
        });


        Schema::create('phong_chieu', function (Blueprint $table) {
            $table->id();
            $table->string('ten_phong', 100);
            $table->string('loai_so_do', 10); // Ví dụ: 8x8, 12x12
            $table->integer('hang_thuong');
            $table->integer('hang_vip');
            $table->boolean('trang_thai')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('loai_ghe', function (Blueprint $table) {
            $table->id();
            $table->enum('ten_loai_ghe', ['Ghế Thường', 'Ghế Vip']);
            $table->timestamps();
        });

        Schema::create('ghe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phong_id')->constrained('phong_chieu')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('loai_ghe_id')->constrained('loai_ghe')->onUpdate('cascade')->onDelete('cascade');
            $table->string('so_ghe', 10);
            $table->char('hang', 1);
            $table->unsignedTinyInteger('cot');
            $table->boolean('trang_thai')->default(true); // true: còn sử dụng, false: đã hỏng
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('lich_chieu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phim_id')->constrained('phim')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('phong_id')->constrained('phong_chieu')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('phien_ban_id')->constrained('phien_ban');
            $table->dateTime('gio_chieu');
            $table->dateTime('gio_ket_thuc');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('gia_ve', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lich_chieu_id')->constrained('lich_chieu')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('loai_ghe_id')->constrained('loai_ghe')->onUpdate('cascade')->onDelete('cascade');
            $table->decimal('gia_ve', 12, 2);
            $table->timestamps();
        });

        Schema::create('dat_ve', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dung')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('lich_chieu_id')->constrained('lich_chieu')->onUpdate('cascade')->onDelete('cascade');
            $table->decimal('tong_tien', 10, 2);
            $table->string('job_id', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('dat_ve_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dat_ve_id')->constrained('dat_ve')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('ghe_id')->constrained('ghe')->onUpdate('cascade')->onDelete('cascade');
            $table->decimal('gia_ve', 10, 2);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('check_ghe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lich_chieu_id')->constrained('lich_chieu')->onUpdate('cascade')->onDelete('cascade');
            $table->string('nguoi_dung_id', 100)->nullable();
            $table->foreignId('ghe_id')->constrained('ghe')->onUpdate('cascade')->onDelete('cascade');
            $table->enum('trang_thai', ['trong', 'da_dat', 'dang_dat']);

            $table->timestamps();
        });

        Schema::create('phuong_thuc_thanh_toan', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 100);
            $table->string('nha_cung_cap', 100);
            $table->text('mo_ta')->nullable();
            $table->timestamps();
        });

        Schema::create('thanh_toan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dat_ve_id')->constrained('dat_ve')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dung')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('phuong_thuc_thanh_toan_id')->constrained('phuong_thuc_thanh_toan')->onUpdate('cascade')->onDelete('cascade');
            $table->string('ma_giao_dich', 255)->unique();
            $table->string('ma_giam_gia_id', 50)->nullable();
            $table->decimal('tong_tien_goc', 10, 2)->nullable();
            $table->string('email', 255);
            $table->string('ho_ten', 255);
            $table->text('qr_code')->nullable(); // base64
            $table->boolean('da_quet')->default(false);
            $table->boolean('ghe_hong')->default(false);
            $table->timestamps();
        });

        Schema::create('do_an', function (Blueprint $table) {
            $table->id();
            $table->string('ten_do_an', 100);
            $table->string('image', 150);
            $table->text('mo_ta')->nullable();
            $table->decimal('gia_nhap', 10, 2);
            $table->decimal('gia_ban', 10, 2);
            $table->integer('so_luong_ton');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('don_do_an', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dat_ve_id')->constrained('dat_ve')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('do_an_id')->constrained('do_an')->onUpdate('cascade')->onDelete('cascade');
            $table->decimal('gia_ban', 10, 2);
            $table->integer('so_luong');
            $table->timestamps();
        });

        Schema::create('ma_giam_gia', function (Blueprint $table) {
            $table->id();
            $table->string('ma', 50)->unique();
            $table->string('image', 150)->nullable();
            $table->decimal('giam_toi_da', 10, 2)->nullable();
            $table->decimal('gia_tri_don_hang_toi_thieu', 10, 2)->nullable();
            $table->float('phan_tram_giam')->nullable();
            $table->date('ngay_bat_dau');
            $table->date('ngay_ket_thuc');
            $table->integer('so_lan_su_dung')->nullable();
            $table->integer('so_lan_da_su_dung')->default(0);
            $table->enum('trang_thai', ['CHƯA KÍCH HOẠT', 'KÍCH HOẠT', 'HẾT HẠN'])->default('KÍCH HOẠT');
            $table->timestamps();
        });

        Schema::create('tin_tuc', function (Blueprint $table) {
            $table->id();
            $table->string('tieu_de', 255);
            $table->text('noi_dung');
            $table->string('hinh_anh', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });


        Schema::create('dat_lai_mat_khau', function (Blueprint $table) {
            $table->id();
            $table->string('email', 100);
            $table->string('token', 255);
            $table->timestamps();
        });


        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('image_url', 255);
            $table->string('link_url', 255)->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fulldb');
    }
};
