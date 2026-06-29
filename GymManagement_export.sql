-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: GymManagement
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','admin123','Nguyễn Quản Trị','0985772330','admin',0.00),(2,'staff@gym.com','staff123','quocvit','0901234567','staff',1000000.00),(4,'hiepcuta@gym.com','123','Nguyễn Hoàng Hiệp','0901234567','staff',100000.00),(5,'hehe@gmail.com','123','Trần Vân Anh','123','staff',100.00);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blogs` (
  `blog_id` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(300) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`blog_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES ('b1','Dinh dưỡng tối ưu cho hiệu suất tập luyện','\n    *1. Tầm quan trọng của việc ăn uống sau khi tập luyện*\n\n    Việc ăn uống hoặc bổ sung một số nguồn thực phẩm vào cơ thể sau khi tập thể thao là một bước vô cùng quan trọng, giúp bạn tối ưu hoá kết quả luyện tập. Trước hết, để lựa chọn được loại thực phẩm phù hợp, bạn cần phải hiểu cơ thể bị ảnh hưởng như thế nào khi hoạt động thể chất.\nKhi bạn đang tập thể thao, cơ bắp sẽ sử dụng hết lượng glycogen dự trữ để làm nhiên liệu. Điều này khiến cho cơ bắp của bạn bị cạn kiệt mất một phần glycogen. Bên cạnh đó, một số loại protein trong cơ cũng bị phá vỡ và hư hại.\nSau khi tập luyện, cơ thể bạn có xu hướng cố gắng phục hồi lại lượng glycogen dự trữ đã bị mất đi, đồng thời sửa chữa cũng như tái tạo lại những protein trong cơ bắp. Vì vậy, việc bổ sung thêm các chất dinh dưỡng phù hợp ngay sau khi tập thể dục sẽ giúp cơ thể bạn nhanh chóng hoàn thành được những mục tiêu trên.\nĂn gì sau khi tập luyện? Các chất dinh dưỡng mà bạn nên tiêu thụ sau khi tập thể dục cần bao gồm cả carbs và protein. Những chất này sẽ giúp cơ thể bạn đạt được một số lợi ích sau:\nGiảm sự phân huỷ protein trong cơ\nTăng tổng hợp protein trong cơ\nKhôi phục nguồn glycogen dự trữ\nTăng cường khả năng phục hồi của cơ thể sau khi tập thể thao\n\n    *2. Những lợi ích của việc bổ sung các chất dinh dưỡng sau khi tập luyện*\n\n    Các chất dinh dưỡng đa lượng, bao gồm chất béo, protein và carbs, giữ một vai trò nhất định trong quá trình phục hồi của cơ thể sau khi tập thể thao.\n  \n2.1. Protein giúp sửa chữa và tái tạo cơ bắp\nTập thể dục khiến kích hoạt sự phân huỷ các protein trong cơ. Tốc độ xảy ra quá trình này sẽ phụ thuộc chủ yếu vào bài tập cũng như mức độ luyện tập của bạn. Thậm chí, ngay cả những vận động viên chuyên nghiệp hoặc người có kỹ năng thể thao tốt cũng gặp phải tình trạng phân huỷ protein trong cơ.\nDo đó, việc tiêu thụ đủ lượng protein sau khi tập luyện sẽ cung cấp cho cơ thể bạn các loại axit amin thiết yếu, giúp hỗ trợ đắc lực cho quá trình sửa chữa và xây dựng lại các protein bị mất đi.\nCác chuyên gia khuyến cáo rằng, bạn nên tiêu thụ khoảng 0.14 – 0.23 gram protein cho mỗi pound trọng lượng cơ thể (0.3 – 0.5 gram/kg) ngay sau khi tập luyện. Thậm chí, khi tiêu thụ từ 20 – 40 gram protein dường như giúp tối đa hoá khả năng phục hồi của cơ thể sau khi tập thể thao.\nSau tập thể thao, người tập nên bổ sung Protein theo khuyến cáo\nSau tập thể thao, người tập nên bổ sung Protein theo khuyến cáo\n  \n2.2. Carbs giúp phục hồi lượng glycogen dự trữ\nCác kho dự trữ glycogen của cơ thể được sử dụng làm nhiên liệu trong quá trình tập thể dục, vì vậy việc tiêu thụ carbs sau khi tập luyện sẽ là một bước cần thiết giúp bạn bổ sung và phục hồi chúng.Tỷ lệ glycogen dự trữ được sử dụng sẽ phụ thuộc vào loại hình hoạt động thể chất của bạn. Chẳng hạn, các môn thể thao sức bền sẽ khiến cơ thể bạn sử dụng nhiều lượng glycogen hơn so với các môn thể thao đối kháng. Vì lý do này, những người tham gia các bài tập luyện sức bền như chạy hoặc bơi lội, cần tiêu thụ nhiều carbs hơn so với vận động viên thể hình.\nNhìn chung, bạn nên tiêu thụ từ 0.5 – 0.7 gram carbs cho mỗi pound trọng lượng cơ thể (1.1 – 1.5 gram/kg) trong vòng 30 phút sau khi tập thể thao nhằm kích hoạt quá trình tái tổng hợp glycogen của cơ bắp.\nHơn nữa, khi bạn tiêu thụ cả carbs và protein cùng lúc sẽ giúp cơ thể tăng tiết insulin và thúc đẩy sự tổng hợp glycogen một cách tốt hơn. Bạn có thể kết hợp nạp carbs và protein theo tỷ lệ 3 : 1, ví dụ 40 gram protein và 120 gram carbs.\nĂn nhiều carbs để xây dựng lại nguồn dự trữ glycogen là điều quan trọng hàng đầu đối với những người tập thể dục thường xuyên, chẳng hạn như hai lần tập trong cùng một ngày.\n  \n2.3. Chất béo giúp thúc đẩy sự phát triển của cơ bắp\nNhiều ý kiến cho rằng ăn chất béo sau khi tập thể thao sẽ làm chậm quá trình tiêu hoá và ức chế sự hấp thụ các chất dinh dưỡng của cơ thể. Tuy nhiên, một số nghiên cứu mới đây đã cho thấy việc tiêu thụ sữa nguyên chất mang lại hiệu quả hơn cho quá trình thúc đẩy sự phát triển của cơ bắp sau khi tập luyện so với sữa tách béo.\nMặt khác, khi tiêu thụ các thực phẩm giàu chất béo sau khi tập gym sẽ không làm ảnh hưởng nhiều đến khả năng tổng hợp glycogen trong cơ bắp.\n    \n*3. Bạn nên ăn vào lúc nào sau khi tập luyện?*\n\nKhả năng xây dựng và phục hồi lượng glycogen cũng như protein của cơ thể sẽ được tăng cường sau khi bạn tập thể dục. Do đó, bạn nên tiêu thụ kết hợp carbs và protein càng sớm càng tốt sau quá trình tập luyện mệt mỏi.\nMặc dù thời gian bổ sung các chất dinh dưỡng đa lượng này không cần phải chính xác hoàn toàn, nhưng nhiều chuyên gia khuyến nghị bạn nên tiêu thụ chúng trong vòng 45 phút sau khi tập thể thao. Việc trì hoãn tiêu thụ carbs ít nhất hai giờ sau khi tập luyện có thể làm giảm tỷ lệ tổng hợp thành công glycogen lên tới 50%.\n    \n*4. Nên ăn gì sau khi tập luyện?*\n\nMục tiêu chính của bữa ăn sau khi tập thể thao là cung cấp cho cơ thể các chất dinh dưỡng phù hợp để phục hồi đầy đủ và tối ưu hoá lợi ích của việc tập luyện.\nBạn nên ăn gì sau khi tập luyện? Lựa chọn các loại thức ăn dễ tiêu sẽ thúc đẩy quá trình hấp thụ dinh dưỡng nhanh hơn. Dưới đây là danh sách các loại thực phẩm mà bạn nên lựa chọn tiêu thụ sau buổi tập, bao gồm:\nThực phẩm chứa carbs:\nSô cô la sữa\nKhoai lang\nHạt diêm mạch\nTrái cây như quả mọng, dứa, kiwi và chuối\nBánh gạo\nBột yến mạch\nCơm\nKhoai tây\nMỳ ống\nRau lá xanh đậm\nMột số loại thực phẩm chứa carbs nên ăn sau khi tập thế thao\nMột số loại thực phẩm chứa carbs nên ăn sau khi tập thế thao\nThực phẩm chứa protein (chất đạm):\nTrứng\nBột protein từ động vật hoặc động vật\nCá hồi\nSữa chua Hy Lạp\nThịt gà\nPho mát Cottage\nCá ngừ\nThanh protein\nThực phẩm chứa chất béo:\nQuả bơ\nQuả hạch\nBơ đậu phộng\nHỗn hợp hạt và trái cây khô\n    \n*5. Một số bữa ăn kiểu mẫu sau khi tập luyện*\n\nSự kết hợp của các loại thực phẩm được liệt kê ở trên có thể tạo ra những bữa ăn tuyệt vời, giúp bạn nhận được đầy đủ các chất dinh dưỡng cần thiết sau khi tập thể thao. Dưới đây là một số bữa ăn kiểu mẫu mà bạn có thể áp dụng sau mỗi buổi tập của mình, bao gồm:\nTrứng tráng bơ cùng với bánh mì nướng\nPhô mai và trái cây\nBánh quy giòn và cá ngừ\nKhoai lang và cá hồi\nBơ đậu phộng và bánh gạo\nHạt diêm mạch cùng với quả hồ đào và quả mọng\nBơ hạnh nhân và bánh mì nướng ngũ cốc nguyên hạt\nSữa tách béo và ngũ cốc\n    \n*6. Đảm bảo uống nhiều nước sau khi tập luyện*\n\nBạn nên uống nhiều nước cả trước và sau khi tập luyện. Khi cơ thể được cung cấp đầy đủ nước sẽ giúp cho các chức năng bên trong hoạt động hiệu quả hơn, từ đó giúp bạn tối ưu hoá những lợi ích của việc tập thể thao.\nTrong quá trình tập luyện, việc đổ mồ hôi sẽ khiến bạn bị mất đi một lượng nước và các chất điện giải. Do đó, bổ sung những chất lỏng này sau buổi tập có thể giúp phục hồi và cải thiện hiệu suất tập luyện.\nNgoài ra, bạn cũng nên đảm bảo uống đầy đủ nước nếu buổi tập tiếp theo sẽ diễn ra trong vòng 12 giờ tới.\nViệc duy trì một chế độ ăn lành mạnh kết hợp cùng với việc tập luyện thể thao thường xuyên sẽ giúp đem lại những lợi ích tuyệt vời cho sức khỏe. Do đó, bạn nên chú ý thực hiện theo nhằm mang lại kết quả tuyệt vời nhất.','blog-1.jpg','2026-03-27 10:00:00'),('b2','Hướng dẫn đặt mục tiêu Fitness thông minh','Bắt đầu với việc tập thể dục\n    Nhiều người trưởng thành gặp khó khăn trong việc tập thể dục hàng ngày. Theo Hướng dẫn Hoạt động Thể chất cho Người Mỹ:\n150 phút hoạt động thể chất cường độ vừa mỗi tuần\n2 ngày tập luyện tăng cường cơ bắp\nMục tiêu SMART có thể giúp bạn vượt qua những trở ngại phổ biến như thiếu động lực hoặc thiếu thời gian bằng cách tạo ra các mục tiêu rõ ràng, có cấu trúc và khả thi.\n    *Mục tiêu SMART là gì?*\n\nSMART là viết tắt của Specific (Cụ thể), Measurable (Đo lường được), Achievable (Khả thi), Relevant (Phù hợp), Time-bound (Có thời hạn).\nCụ thể (Specific)\n*Mục tiêu của bạn nên trả lời được ai, cái gì, khi nào, ở đâu và tại sao?*\n    Ví dụ: “tập thể dục nhiều hơn” không cụ thể.\nNhưng: “Đi bộ 30 phút vào buổi sáng quanh khu phố 5 lần/tuần” đã đầy đủ thông tin cần thiết.\nĐo lường được (Measurable)\n    *Bạn sẽ theo dõi tiến trình thế nào?*\n\nHãy tìm cách để đo lường sự thành công, ví dụ như dùng lịch hoặc điện thoại để ghi lại các ngày bạn hoàn thành mục tiêu.\nKhả thi (Achievable)\n    *Mục tiêu của bạn có thực tế không?*\n\nNếu bạn chưa từng chạy, không nên đặt mục tiêu chạy mỗi ngày. Thay vào đó, hãy bắt đầu với vài lần chạy mỗi tuần. Bắt đầu nhỏ để dễ đạt được và tạo động lực cho bản thân.\nPhù hợp (Relevant)\n    *Mục tiêu này có quan trọng với bạn không?*\nDù động lực của bạn là để theo kịp con cái hay cải thiện sức khỏe, hãy đảm bảo mục tiêu là điều bạn thực sự muốn đạt.\nCó thời hạn (Time-bound)\n    *Hãy đặt thời hạn hoàn thành cho mục tiêu!*\nNhiều người thấy rằng thời hạn là động lực để bắt đầu ngay hôm nay.\n\n\n    *Ví dụ về mục tiêu SMART*\n“Tôi sẽ đi bộ 30 phút trong giờ nghỉ trưa 5 lần/tuần. Tôi sẽ theo dõi tiến trình bằng lịch điện thoại và hy vọng đạt mục tiêu này trước cuối năm. Mục tiêu này sẽ cải thiện sức khỏe tim mạch và giúp tôi theo kịp các con tốt hơn!”\nCụ thể: Bao gồm cái gì, ở đâu, khi nào.\nĐo lường được: Sử dụng lịch điện thoại để theo dõi tiến trình.\nKhả thi: Nếu đi bộ 30 phút là khả năng của bạn, thì mục tiêu khả thi. Bạn có thể nâng dần lên nếu muốn.\nPhù hợp: Giúp cải thiện sức khỏe và theo kịp con cái.\nCó thời hạn: Có ngày kết thúc để tạo động lực bắt đầu ngay.\nMẹo khác để đặt mục tiêu\nNếu bạn chưa có hình thức tập thể dục yêu thích, một mục tiêu SMART tốt có thể là thử một loại hình tập luyện mới mỗi tuần cho đến khi tìm thấy điều mình thích.\nCó nhiều video online và tài nguyên miễn phí giúp bạn thử nghiệm mà không tốn chi phí.','blog-2.jpg','2026-03-27 09:00:00'),('b3','Kỹ thuật tập luyện hiệu quả cho người bận rộn','SKĐS – Bí quyết tập luyện cho người bận rộn\n\nVới người bận rộn, công việc chiếm hết tâm trí và sức lực, khiến họ không còn thời gian để tập luyện, duy trì sức khỏe cơ thể và tinh thần.\nTuy nhiên, không vì bận rộn mà bỏ qua vận động, bởi bệnh tật có thể “ghé thăm” bất cứ lúc nào. Dưới đây là một số bí quyết giúp bạn tập luyện hiệu quả ngay cả khi thời gian hạn hẹp.\n\n*1. Các bài tập gym nhanh tại phòng*\n\nDành cho những người làm việc văn phòng, một bài tập 20 phút tại nhà hoặc phòng làm việc đã mang lại hiệu quả đáng kể. Mặc dù thời gian ngắn, nhưng nếu biết tận dụng và chọn đúng bài tập, kết quả sẽ vượt mong đợi.\nBạn có thể thực hiện các chuỗi động tác:\nJumping jacks (nhảy bật chân sang hai bên và giơ tay lên đầu): 30 lần, tập nhiều hiệp nếu có thể.\nHít đất: 10–20 cái hoặc ngồi dựa tường trong 1 phút.\nBurpees: bao gồm chống đẩy, ngồi xổm và bật nhảy.\nSquat: đứng lên – ngồi xuống, hạ mông và đùi song song với mặt đất.\nPhương pháp này rất phù hợp với những khu vực không có trung tâm thể thao hay nơi đi bộ thuận tiện.\n\n*2. Chạy bộ hoặc đi bộ*\n\nTập thể dục không nhất thiết tốn thời gian hay chi phí. Một trong những bài tập đơn giản nhất là chạy bộ.\nChọn địa điểm gần nhà như công viên, sân chơi, để tiết kiệm thời gian di chuyển.\nTập bất cứ lúc nào: sáng sớm, chiều muộn hoặc khoảng 60 phút sau bữa tối.\n\n*3. Tập yoga theo hướng dẫn trên Internet*\n\nNếu không thích các bài tập thể hình, bạn có thể dành 15–30 phút mỗi ngày để thư giãn với yoga theo video hướng dẫn trực tuyến.\nYoga giúp giảm stress, tăng sự dẻo dai và cải thiện chất lượng cuộc sống.\nCó rất nhiều bài tập phù hợp với nhu cầu và điều kiện khác nhau.\n\n*4. Đi làm bằng phương tiện công cộng – mẹo xuống sớm một bến*\n\nMột cách dễ nhưng hiệu quả để vận động là xuống trước một bến.\nBạn sẽ về nhà muộn hơn khoảng 10 phút, nhưng cơ thể được vận động nhiều hơn.\nHoạt động này giúp tâm trạng tích cực, hoàn toàn khác với việc ngồi chật chội trên xe.\n\n*5. Tận dụng mọi nơi để tập luyện*\n\nBạn có thể sáng tạo các hoạt động vận động phù hợp với bản thân:\nĐi bộ lên cầu thang thay vì thang máy.\nDùng xe đạp thay cho phương tiện khác.\nCuối tuần, đạp xe cùng gia đình để vừa tập luyện vừa thư giãn.\nCác hoạt động hàng ngày cũng giúp đốt calories và duy trì sức khỏe nếu bạn quyết tâm và kỷ luật.\n\n*Lưu ý quan trọng*\n\nNên xen kẽ các bài tập để tránh nhàm chán:\nNgày 1: các động tác tại nhà\nNgày 2: yoga để tăng linh hoạt\nNgày 3: chạy bộ, hít thở không khí trong lành\nViệc xen kẽ các bài tập giúp bạn duy trì thói quen lâu dài mà không bỏ cuộc giữa chừng.','blog-3.jpg','2026-03-27 08:00:00'),('b4','Cẩm nang chạy bộ cho người mới bắt đầu','Lợi ích tuyệt vời của chạy bộ\n\nChạy bộ không chỉ là hoạt động thể dục đơn thuần mà còn mang lại nhiều lợi ích cho sức khỏe thể chất và tinh thần.\n\n*1. Lợi ích cho sức khỏe thể chất*\n\nTăng cường sức khỏe tim mạch: Giảm nguy cơ mắc các bệnh như cao huyết áp, xơ vữa động mạch.\nGiảm cân và duy trì vóc dáng: Chạy bộ đốt cháy nhiều calo.\nTăng sức bền cơ bắp: Đặc biệt là cơ chân.\nTăng mật độ xương: Giảm nguy cơ loãng xương và các bệnh về khớp.\nCải thiện giấc ngủ: Giúp cơ thể mệt mỏi và dễ đi vào giấc ngủ sâu hơn.\nTăng cường hệ miễn dịch: Giúp cơ thể chống lại bệnh tật.\n\n*2. Lợi ích cho sức khỏe tinh thần*\n\nGiảm căng thẳng và lo âu: Chạy bộ giúp giải phóng endorphin, hormone mang lại cảm giác hạnh phúc và tự tin.\nCải thiện tập trung và ghi nhớ: Chạy bộ tăng lưu thông máu đến não, giúp não bộ hoạt động hiệu quả hơn, thúc đẩy sự sáng tạo.\nKết luận: Chạy bộ là một cách tuyệt vời để nâng cao sức khỏe tổng thể và cải thiện chất lượng cuộc sống.\n\n*Cách bắt đầu chạy bộ hiệu quả cho người mới*\n1. Khám sức khỏe\n\nTrước khi bắt đầu, hãy đi khám tổng quát để đảm bảo cơ thể khỏe mạnh, đặc biệt là tim mạch.\n\n2. Chuẩn bị kỹ lưỡng\n\nGiày chạy: Phù hợp với bàn chân và địa hình chạy.\nQuần áo: Thoải mái, thấm hút mồ hôi.\nNước: Mang theo để tránh mất nước, đặc biệt khi thời tiết nóng.\n\n3. Lịch tập khởi đầu\n\nBắt đầu từ đi bộ xen kẽ chạy chậm: Ví dụ đi bộ 2 phút, chạy 1 phút, lặp lại.\nTăng dần thời gian và quãng đường: Mỗi tuần tăng từ từ để cơ thể thích nghi.\nLên lịch tuần: Bao gồm cả ngày nghỉ để phục hồi.\nMục tiêu nhỏ, thực tế: Giúp tạo động lực và tránh nản lòng.\n\n4. Khởi động và giãn cơ\n\nTrước khi chạy: Khởi động nhẹ nhàng, xoay khớp, khởi động chân.\nSau khi chạy: Giãn cơ để giảm đau nhức và giúp phục hồi cơ bắp.\n\n5. Lắng nghe cơ thể\n\nNếu cảm thấy đau nhức quá mức, hãy dừng lại và nghỉ ngơi, tránh cố gắng quá sức.\n\n6. Gợi ý lịch tập cho người mới\n\nTuần 1: 3 buổi/tuần, mỗi buổi 20-30 phút, kết hợp đi bộ và chạy.\nTuần 2-4: Tăng dần thời gian chạy, giảm đi bộ.\nTuần 5 trở đi: Tăng quãng đường, có thể thêm bài tập cường độ cao (interval training).\n\n*Kỹ thuật chạy bộ hiệu quả*\n1. Tư thế chạy đúng\n\nĐầu và cổ: Giữ thẳng, mắt nhìn về phía trước, cằm hơi nâng.\nLưng: Thẳng, vai thả lỏng.\nTay: Vung tự nhiên, khuỷu tay gập khoảng 90 độ.\nChân: Bước vừa phải, tiếp đất bằng phần giữa hoặc trước bàn chân, tránh tiếp đất bằng gót quá mạnh.\n\n2. Nhịp thở\n\nHít vào bằng mũi, thở ra bằng miệng.\nĐiều chỉnh nhịp thở phù hợp với tốc độ chạy.\nLợi ích: Giảm nguy cơ chấn thương, tối ưu năng lượng, chạy lâu hơn, tư thế đẹp và lưng thẳng.\n\n\n*Chế độ dinh dưỡng cho người chạy bộ*\n1. Nguyên tắc dinh dưỡng\n\nCân bằng nhóm chất:\n\nCarbohydrate: Ngũ cốc nguyên hạt, khoai lang, trái cây.\nProtein: Thịt nạc, cá, trứng, đậu, các loại hạt.\nChất béo lành mạnh: Dầu ô liu, quả bơ, các loại hạt.\nVitamin và khoáng chất: Tăng cường hệ miễn dịch, hỗ trợ chuyển hóa năng lượng.\nUống đủ nước: Trước, trong và sau khi chạy.\nChia nhỏ bữa ăn: Cung cấp năng lượng đều đặn.\nTránh thực phẩm chế biến sẵn: Ưu tiên thực phẩm tươi, ít chất béo, ít đường và muối.\n\n2. Mẫu thực đơn\n\nTrước khi chạy:\n\n2–3 giờ trước: Bữa giàu carbohydrate, ít chất xơ và béo (yến mạch, bánh mì ngũ cốc, trái cây).\n30 phút trước: Ăn nhẹ (chuối, bánh quy gạo).\n\nSau khi chạy:\n\nTrong 30 phút: Bổ sung carbohydrate và protein (sữa chua, sữa, trái cây, hạt).\n2 giờ sau: Bữa chính đầy đủ các nhóm chất dinh dưỡng.','blog-4.jpg','2026-03-27 07:00:00');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipments`
--

DROP TABLE IF EXISTS `equipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipments` (
  `equipment_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `status` enum('Hoạt động','Bảo trì','Hỏng') DEFAULT 'Hoạt động',
  `purchase_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`equipment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipments`
--

LOCK TABLES `equipments` WRITE;
/*!40000 ALTER TABLE `equipments` DISABLE KEYS */;
INSERT INTO `equipments` VALUES (1,'Máy chạy bộ Kingsport','Cardio',5,'Hoạt động','2023-01-15','2026-03-27 21:51:18'),(2,'Tạ đơn (Ziva) 5-20kg','Thể hình',20,'Hoạt động','2023-02-10','2026-03-27 21:51:18'),(3,'Máy đạp xe Elip','Cardio',3,'Bảo trì','2023-01-20','2026-03-27 21:51:18'),(4,'Khung gánh tạ squat','Thể hình',2,'Hoạt động','2023-03-05','2026-03-27 21:51:18'),(5,'Máy chạy bộ Kingsport','Cardio',5,'Hoạt động','2023-01-15','2026-03-27 21:51:18'),(6,'Tạ đơn (Ziva) 5-20kg','Thể hình',20,'Hoạt động','2023-02-10','2026-03-27 21:51:18'),(7,'Máy đạp xe Elip','Cardio',3,'Bảo trì','2023-01-20','2026-03-27 21:51:18'),(8,'Khung gánh tạ squat','Thể hình',2,'Hoạt động','2023-03-05','2026-03-27 21:51:18'),(9,'tạ đơn','Thể hình',10,'Hoạt động','2026-04-01','2026-04-01 22:04:28');
/*!40000 ALTER TABLE `equipments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_subscriptions`
--

DROP TABLE IF EXISTS `member_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `member_subscriptions` (
  `subscription_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Active','Expired','Cancelled') DEFAULT 'Active',
  `trainer_id` int(11) DEFAULT NULL,
  `course_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`subscription_id`),
  KEY `member_id` (`member_id`),
  KEY `package_id` (`package_id`),
  KEY `fk_subs_trainer` (`trainer_id`),
  CONSTRAINT `fk_subs_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`trainer_id`) ON DELETE SET NULL,
  CONSTRAINT `member_subscriptions_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `member_subscriptions_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `membership_packages` (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_subscriptions`
--

LOCK TABLES `member_subscriptions` WRITE;
/*!40000 ALTER TABLE `member_subscriptions` DISABLE KEYS */;
INSERT INTO `member_subscriptions` VALUES (1,1,3,'2023-01-10','2024-01-10','Expired',NULL,NULL),(2,2,2,'2023-08-20','2023-08-20','Expired',NULL,NULL),(3,3,1,'2023-12-01','2023-12-01','Expired',NULL,NULL),(4,4,1,'2022-12-01','2023-01-01','Expired',NULL,NULL),(5,5,2,'2023-12-15','2024-03-15','Expired',NULL,NULL),(9,8,3,'2026-01-16','2027-03-28','Cancelled',NULL,NULL),(21,8,3,'2026-03-27','2027-03-28','Cancelled',NULL,'Cardio'),(22,8,3,'2026-03-27','2027-03-28','Cancelled',NULL,'Body Building'),(25,10,3,'2026-04-01','2027-04-01','Cancelled',1,'Body Building'),(26,10,3,'2026-04-01','2027-04-01','Cancelled',1,'Body Building'),(27,10,3,'2026-04-01','2027-04-01','Cancelled',NULL,'Body Building'),(28,10,3,'2026-04-01','2027-04-01','Cancelled',1,'Body Building'),(29,8,3,'2026-04-01','2027-04-01','Cancelled',1,'Body Building'),(30,8,2,'2026-04-01','2026-06-30','Cancelled',1,'Body Building'),(31,8,3,'2026-04-01','2027-04-01','Cancelled',NULL,NULL),(32,8,3,'2026-04-02','2027-04-02','Active',1,'Body Building');
/*!40000 ALTER TABLE `member_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `members` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'Phạm Văn Mạnh','manh.pham@email.com','123456','0912345678','Hà Nội','Male','Active'),(2,'Trần Thị Hương','huong.tran@email.com','123456','0987654321','Cầu Giấy','Male','Active'),(3,'Lê Hoàng Nam','nam.le@email.com','123456','0909090909','Thanh Xuân','Male','Active'),(4,'Nguyễn Thu Thảo','thao.nguyen@email.com','123456','0911223344','Đống Đa','Male','Inactive'),(5,'Đỗ Hùng Dũng','dung.do@email.com','123456','0977889900','Hai Bà Trưng','Male','Active'),(8,'Trần Hữu Mạnh','hehe@gmail.com','$2y$10$sa7YBRdT79EobSWL8lmXzOjBbnW5xiSwYmU9gska6.CdNBhJEZaDe','0989089809','Hà Tĩnh','Male','Active'),(10,'Nguyễn Văn Minh','minh6a1boi@gmail.com','$2y$10$Nsripz/.qmMzErQhCzNcdeURQpHpgNT1ptKbevOI3m3NpT3Yd34I2','0989089809','Hồ Chí Minh','Male','Active'),(21,'Test User','user123@gmail.com','Password123','0987654321','Hà Nội','Male','Active');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership_packages`
--

DROP TABLE IF EXISTS `membership_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `membership_packages` (
  `package_id` int(11) NOT NULL AUTO_INCREMENT,
  `package_name` varchar(100) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_packages`
--

LOCK TABLES `membership_packages` WRITE;
/*!40000 ALTER TABLE `membership_packages` DISABLE KEYS */;
INSERT INTO `membership_packages` VALUES (1,'Gói 1 Tháng (Basic)',30,500000.00,'Tập full giờ, không PT'),(2,'Gói 3 Tháng (Standard)',90,1350000.00,'Tặng 1 buổi PT, khăn tắm'),(3,'Gói 1 Năm (VIP)',365,5000000.00,'Full dịch vụ, tủ đồ riêng, xông hơi');
/*!40000 ALTER TABLE `membership_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `image` varchar(300) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `type` enum('general','schedule') DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`notification_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Thông báo nghỉ lễ',NULL,'Phòng tập sẽ đóng cửa vào ngày 01/01/2024 để bảo trì.','2025-12-20 08:20:45',1,NULL,'general',1),(2,'Khuyến mãi Giáng sinh',NULL,'Giảm 20% cho tất cả các gói gia hạn trước ngày 24/12.','2025-12-20 08:20:45',1,NULL,'general',1),(4,'hehe','1768543725_buoi2lis.png','hehe','2026-01-16 13:08:45',1,NULL,'general',1),(5,'📅 Lịch tập mới: Tập chân',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Tập chân\n• Ngày: 02/04/2026  |  Giờ: 16:11 – 17:11\n• Ghi chú: hoho','2026-04-01 23:11:48',NULL,10,'schedule',1),(6,'📅 Lịch tập mới: Tập chân',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Tập chân\n• Ngày: 03/04/2026  |  Giờ: 09:13 – 10:13\n','2026-04-02 08:13:49',NULL,8,'schedule',1),(7,'📅 Lịch tập mới: Buổi tập cá nhân',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Buổi tập cá nhân\n• Ngày: 16/04/2026  |  Giờ: 18:46 – 21:46\n• Ghi chú: tập chân','2026-04-15 22:46:17',NULL,8,'schedule',1),(8,'📅 Lịch tập mới: Buổi tập cá nhân',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Buổi tập cá nhân\n• Ngày: 18/04/2026  |  Giờ: 18:27 – 20:27\n• Ghi chú: tập tay','2026-04-15 23:27:24',NULL,8,'schedule',1),(9,'📅 Lịch tập mới: Buổi tập tập thể',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Buổi tập tập thể\n• Ngày: 16/04/2026  |  Giờ: 18:30 – 20:30\n• Ghi chú: Tập erobic','2026-04-15 23:31:13',NULL,8,'schedule',1),(10,'📅 Lịch tập mới: Buổi tập tập thể',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Buổi tập tập thể\n• Ngày: 16/04/2026  |  Giờ: 18:30 – 20:30\n• Ghi chú: Tập erobic','2026-04-15 23:31:18',NULL,8,'schedule',1),(11,'📅 Lịch tập mới: Buổi tập tập thể',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Buổi tập tập thể\n• Ngày: 16/04/2026  |  Giờ: 18:30 – 20:30\n• Ghi chú: Tập erobic','2026-04-15 23:31:18',NULL,8,'schedule',1),(12,'📅 Lịch tập mới: Buổi tập tập thể',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Buổi tập tập thể\n• Ngày: 16/04/2026  |  Giờ: 18:30 – 20:30\n• Ghi chú: Tập erobic','2026-04-15 23:31:18',NULL,8,'schedule',1),(13,'📅 Lịch tập mới: Buổi tập tập thể',NULL,'HLV Hiệp Cử Tạ đã lên lịch cho bạn:\n• Nội dung: Buổi tập tập thể\n• Ngày: 16/04/2026  |  Giờ: 18:30 – 20:30\n• Ghi chú: Tập erobic','2026-04-15 23:31:18',NULL,8,'schedule',1);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_trainers`
--

DROP TABLE IF EXISTS `package_trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `package_trainers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `trainer_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pkg_trainer` (`package_id`,`trainer_id`),
  KEY `fk_pkg_trainers_trainer` (`trainer_id`),
  CONSTRAINT `fk_pkg_trainers_pkg` FOREIGN KEY (`package_id`) REFERENCES `membership_packages` (`package_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pkg_trainers_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`trainer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_trainers`
--

LOCK TABLES `package_trainers` WRITE;
/*!40000 ALTER TABLE `package_trainers` DISABLE KEYS */;
/*!40000 ALTER TABLE `package_trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pt_schedules`
--

DROP TABLE IF EXISTS `pt_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pt_schedules` (
  `schedule_id` int(11) NOT NULL AUTO_INCREMENT,
  `trainer_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `session_date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `session_title` varchar(150) DEFAULT 'Buổi tập cá nhân',
  `status` enum('Chờ xác nhận','Xác nhận','Hoàn thành','Đã hủy') DEFAULT 'Chờ xác nhận',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`schedule_id`),
  KEY `trainer_id` (`trainer_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `pt_schedules_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`trainer_id`) ON DELETE CASCADE,
  CONSTRAINT `pt_schedules_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pt_schedules`
--

LOCK TABLES `pt_schedules` WRITE;
/*!40000 ALTER TABLE `pt_schedules` DISABLE KEYS */;
INSERT INTO `pt_schedules` VALUES (4,1,10,'2026-04-02','08:00:00','09:00:00','Tap Mong & Dui (Glutes & Quads)','Hoàn thành','Hoc vien toi som 10p de khoi dong','2026-04-01 23:49:02'),(5,1,10,'2026-04-04','17:30:00','18:30:00','Cardio + ABS','Hoàn thành','Cam theo nuoc va khan','2026-04-01 23:49:02'),(6,1,9,'2026-04-03','18:00:00','19:00:00','Tap Nguc & Tay Truoc','Chờ xác nhận','Khong an qua no truoc tap','2026-04-01 23:49:02'),(7,1,10,'2026-03-30','16:00:00','17:00:00','Lung xo','Hoàn thành','Tap rat tot','2026-04-01 23:49:02'),(8,1,8,'2026-04-03','09:13:00','10:13:00','Tập chân','Hoàn thành','','2026-04-02 08:13:49'),(10,1,8,'2026-04-18','18:27:00','20:27:00','Buổi tập cá nhân','Chờ xác nhận','tập tay','2026-04-15 23:27:24'),(15,1,8,'2026-04-16','18:30:00','20:30:00','Buổi tập tập thể','Xác nhận','Tập erobic','2026-04-15 23:31:18');
/*!40000 ALTER TABLE `pt_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pt_workouts`
--

DROP TABLE IF EXISTS `pt_workouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pt_workouts` (
  `workout_id` int(11) NOT NULL AUTO_INCREMENT,
  `trainer_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `difficulty` enum('Cơ bản','Trung bình','Nâng cao') DEFAULT 'Cơ bản',
  `duration_weeks` int(11) DEFAULT 4,
  `content` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`workout_id`),
  KEY `trainer_id` (`trainer_id`),
  CONSTRAINT `pt_workouts_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`trainer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pt_workouts`
--

LOCK TABLES `pt_workouts` WRITE;
/*!40000 ALTER TABLE `pt_workouts` DISABLE KEYS */;
INSERT INTO `pt_workouts` VALUES (1,1,'Buil tổng thể','dành cho người béo phì','Trung bình',5,'hehe','2026-04-01 22:08:19'),(2,1,'Cardio Dot Mo Nhanh','Chuong trinh cardio cuong do cao ngat quang (HIIT) giup dot chay calo toi da.','Cơ bản',4,NULL,'2026-04-01 23:49:02'),(3,1,'Suc Manh & Co Bap','Tap ta nang ket hop cac bai compound (Squat, Deadlift, Bench Press).','Trung bình',8,NULL,'2026-04-01 23:49:02'),(4,1,'Thon Gon Toan Than','Ket hop ta nhe va cardio giup san chac co the, phu hop muc tieu giam can.','Cơ bản',6,NULL,'2026-04-01 23:49:02');
/*!40000 ALTER TABLE `pt_workouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainer_reviews`
--

DROP TABLE IF EXISTS `trainer_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trainer_reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `trainer_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_review` (`trainer_id`,`member_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `trainer_reviews_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`trainer_id`) ON DELETE CASCADE,
  CONSTRAINT `trainer_reviews_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainer_reviews`
--

LOCK TABLES `trainer_reviews` WRITE;
/*!40000 ALTER TABLE `trainer_reviews` DISABLE KEYS */;
INSERT INTO `trainer_reviews` VALUES (2,1,10,5,'ổn','2026-04-01 21:59:43'),(3,1,8,5,'oke','2026-04-02 07:51:52');
/*!40000 ALTER TABLE `trainer_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trainers` (
  `trainer_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `specialty` varchar(100) NOT NULL,
  `image` varchar(300) DEFAULT NULL,
  `facebook_url` varchar(300) DEFAULT '#',
  `twitter_url` varchar(300) DEFAULT '#',
  `youtube_url` varchar(300) DEFAULT '#',
  `created_at` datetime DEFAULT current_timestamp(),
  `rating` decimal(3,1) DEFAULT 5.0,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`trainer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainers`
--

LOCK TABLES `trainers` WRITE;
/*!40000 ALTER TABLE `trainers` DISABLE KEYS */;
INSERT INTO `trainers` VALUES (1,'Hiệp Cử Tạ','HLV Thể Hình','pthiepcuta.jpg','https://www.facebook.com/hoang.hiep.853060','https://www.facebook.com','https://www.facebook.com','2026-03-27 21:51:18',5.0,'hiepcuta@fit.com','$2y$10$6VC8WumwGqQbGgq0UZI78uuLV08OriK1oNuG9MC2MiBg2cyUjOtA2'),(2,'ROSY RIVERA','HLV Cardio','trainer-2.jpg','#','#','#','2026-03-27 21:51:18',5.0,'trainer2@fit.com','123456'),(3,'MATT STONIE','HLV Fitness','trainer-3.jpg','#','#','#','2026-03-27 21:51:18',5.0,'trainer3@fit.com','123456'),(4,'SOFIA LAUREN','HLV Crossfit','trainer-4.jpg','#','#','#','2026-03-27 21:51:18',5.0,'trainer4@fit.com','123456');
/*!40000 ALTER TABLE `trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_type` enum('Registration','Renewal','Upgrade') NOT NULL,
  `transaction_date` datetime DEFAULT current_timestamp(),
  `note` text DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,1,5000000.00,'Chuyển khoản','Registration','2023-01-10 09:00:00','Đăng ký VIP'),(2,2,1350000.00,'Tiền mặt','Renewal','2023-05-20 10:30:00','Gia hạn lần 1'),(4,3,500000.00,'Momo','Registration','2023-11-01 14:00:00','Khách vãng lai'),(6,5,1350000.00,'Chuyển khoản','Registration','2023-12-15 17:45:00','Khách mới'),(24,8,5000000.00,'Tiền mặt','Registration','2026-03-28 00:19:51','Thanh toán (Tiền mặt): Gói 1 Năm (VIP)'),(30,10,5000000.00,'Tiền mặt','Registration','2026-04-01 23:17:58','Thanh toán (Tiền mặt): Gói 1 Năm (VIP)'),(31,8,5000000.00,'Tiền mặt','Registration','2026-04-02 00:16:13','Thanh toán (Tiền mặt): Gói 1 Năm (VIP)'),(32,8,1350000.00,'Tiền mặt','Registration','2026-04-02 00:18:07','Thanh toán (Tiền mặt): Gói 3 Tháng (Standard)'),(33,8,5000000.00,'Tiền mặt','Registration','2026-04-02 08:12:52','Thanh toán (Tiền mặt): Gói 1 Năm (VIP)');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-16  0:08:32
