<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Phim;

class PhimSeeder extends Seeder
{
    public function run()
    {
        
        // 7 phim đang chiếu (tính đến 11/10/2025)
        Phim::create([
            'ten_phim' => 'Dune: Part Two',
            'mo_ta' => 'Hành trình tiếp nối của Paul Atreides trên hành tinh Arrakis.',
            'thoi_luong' => 166,
            'trailer' => 'https://www.youtube.com/watch?v=n9xhJrPXop4',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2024-03-01',
            'ngay_ket_thuc' => '2025-12-31',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Deadpool & Wolverine',
            'mo_ta' => 'Cuộc phiêu lưu hài hước của Deadpool và Wolverine.',
            'thoi_luong' => 127,
            'trailer' => 'https://www.youtube.com/watch?v=jdOaQ_8C8e0',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2024-07-26',
            'ngay_ket_thuc' => '2025-11-30',
            'do_tuoi_gioi_han' => '18+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Moana 2',
            'mo_ta' => 'Cuộc phiêu lưu mới của Moana trên đại dương.',
            'thoi_luong' => 120,
            'trailer' => 'https://www.youtube.com/watch?v=2Wqb8e1o9aI',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2024-11-27',
            'ngay_ket_thuc' => '2026-01-15',
            'do_tuoi_gioi_han' => 'Tất cả',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Joker: Folie à Deux',
            'mo_ta' => 'Câu chuyện tình yêu điên rồ của Joker và Harley Quinn.',
            'thoi_luong' => 138,
            'trailer' => 'https://www.youtube.com/watch?v=Eh2J9jI3KkQ',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2024-10-04',
            'ngay_ket_thuc' => '2025-12-01',
            'do_tuoi_gioi_han' => '18+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Gladiator II',
            'mo_ta' => 'Tiếp nối cuộc chiến khốc liệt trong đấu trường La Mã.',
            'thoi_luong' => 150,
            'trailer' => 'https://www.youtube.com/watch?v=6YfQ8p1bSAo',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2024-11-15',
            'ngay_ket_thuc' => '2026-02-28',
            'do_tuoi_gioi_han' => '16+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Wicked',
            'mo_ta' => 'Câu chuyện phía sau thế giới của Oz.',
            'thoi_luong' => 160,
            'trailer' => 'https://www.youtube.com/watch?v=3n3j8b6Yh9U',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2024-11-22',
            'ngay_ket_thuc' => '2025-12-31',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Mufasa: The Lion King',
            'mo_ta' => 'Câu chuyện về vua sư tử Mufasa.',
            'thoi_luong' => 135,
            'trailer' => 'https://www.youtube.com/watch?v=7dO4eH0q9kA',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2024-12-20',
            'ngay_ket_thuc' => '2026-01-31',
            'do_tuoi_gioi_han' => 'Tất cả',
            'loai_suat_chieu' => 'Thường',
        ]);

        // 7 phim sắp chiếu 
        Phim::create([
            'ten_phim' => 'Avatar: Fire and Ash',
            'mo_ta' => 'Hành trình mới trên hành tinh Pandora.',
            'thoi_luong' => 180,
            'trailer' => 'https://www.youtube.com/watch?v=EXAMPLE_ID_1',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2025-12-19',
            'ngay_ket_thuc' => '2026-03-31',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Star Wars: New Hope II',
            'mo_ta' => 'Chương mới trong vũ trụ Star Wars.',
            'thoi_luong' => 145,
            'trailer' => 'https://www.youtube.com/watch?v=EXAMPLE_ID_2',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2026-05-15',
            'ngay_ket_thuc' => '2026-07-31',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Spider-Man: Beyond the Multiverse',
            'mo_ta' => 'Cuộc chiến đa vũ trụ của Spider-Man.',
            'thoi_luong' => 140,
            'trailer' => 'https://www.youtube.com/watch?v=EXAMPLE_ID_3',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2026-07-01',
            'ngay_ket_thuc' => '2026-09-30',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Black Panther: Wakanda Forever II',
            'mo_ta' => 'Tiếp nối câu chuyện của Wakanda.',
            'thoi_luong' => 155,
            'trailer' => 'https://www.youtube.com/watch?v=EXAMPLE_ID_4',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2026-02-14',
            'ngay_ket_thuc' => '2026-04-30',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'The Batman II',
            'mo_ta' => 'Batman đối mặt với kẻ thù mới.',
            'thoi_luong' => 165,
            'trailer' => 'https://www.youtube.com/watch?v=EXAMPLE_ID_5',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2026-03-01',
            'ngay_ket_thuc' => '2026-05-31',
            'do_tuoi_gioi_han' => '16+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Fast X: Part 2',
            'mo_ta' => 'Cuộc đua tốc độ đỉnh cao tiếp theo.',
            'thoi_luong' => 130,
            'trailer' => 'https://www.youtube.com/watch?v=EXAMPLE_ID_6',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2026-04-10',
            'ngay_ket_thuc' => '2026-06-30',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);

        Phim::create([
            'ten_phim' => 'Mission: Impossible - Dead Reckoning Part Two',
            'mo_ta' => 'Ethan Hunt đối mặt với thử thách cuối cùng.',
            'thoi_luong' => 160,
            'trailer' => 'https://www.youtube.com/watch?v=EXAMPLE_ID_7',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'https://www.elleman.vn/app/uploads/2025/09/28/252655/chainsaw-man-the-movie-reze-arc_tgw5.jpg',
            'ngay_cong_chieu' => '2026-06-28',
            'ngay_ket_thuc' => '2026-09-15',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);
    }
}