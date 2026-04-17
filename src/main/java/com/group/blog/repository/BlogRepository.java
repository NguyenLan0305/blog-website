package com.group.blog.repository;

import com.group.blog.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    // 🔥 CÂU LỆNH TỐI ƯU CHUẨN 3NF (Chỉ lấy bài ĐÃ XUẤT BẢN: draft = false)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b " +
            "WHERE b.draft = false " + // <-- THÊM ĐIỀU KIỆN TẠI ĐÂY
            "ORDER BY b.createdAt DESC")
    List<Object[]> findAllBlogsWithCounts();

    // Lấy bài viết theo Category ID (Chỉ lấy bài đã xuất bản)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b WHERE b.category.id = :categoryId AND b.draft = false") // <-- THÊM
    List<Object[]> findBlogsByCategoryIdWithCounts(@Param("categoryId") UUID categoryId);

    // Lọc theo Tag (Chỉ lấy bài đã xuất bản)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b JOIN b.tags t WHERE t.id = :tagId AND b.draft = false") // <-- THÊM
    List<Object[]> findBlogsByTagIdWithCounts(@Param("tagId") UUID tagId);

    // Tìm kiếm bài viết theo tiêu đề (Chỉ lấy bài đã xuất bản)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND b.draft = false") // <-- THÊM
    List<Object[]> searchBlogsByKeywordWithCounts(@Param("keyword") String keyword);

    // 🔥 ĐỔI TÊN HÀM: Chỉ lấy 5 bài viết khớp tiêu đề và phải LÀ BÀI ĐÃ XUẤT BẢN
    List<Blog> findTop5ByTitleContainingIgnoreCaseAndDraftIsFalse(String title);

    // Tìm kiếm KẾT HỢP cả Từ khóa VÀ Danh mục (Chỉ lấy bài đã xuất bản)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "AND b.category.id = :categoryId AND b.draft = false") // <-- THÊM
    List<Object[]> findByKeywordAndCategoryIdWithCounts(@Param("keyword") String keyword, @Param("categoryId") UUID categoryId);

    // ⚠️ GIỮ NGUYÊN: Lấy bài viết của Tác giả (Lấy CẢ BẢN NHÁP VÀ ĐÃ XUẤT BẢN cho trang Dashboard)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b WHERE b.author.username = :username " +
            "ORDER BY b.createdAt DESC")
    List<Object[]> findByAuthorUsernameWithCounts(@Param("username") String username);


    // Lấy bài viết ĐÃ XUẤT BẢN của một tác giả dựa vào username (Cho trang Profile Public)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b WHERE b.author.username = :username AND b.draft = false " +
            "ORDER BY b.createdAt DESC")
    List<Object[]> findPublishedByAuthorUsernameWithCounts(@Param("username") String username);

    List<Blog> findTop5ByOrderByCreatedAtDesc();
}