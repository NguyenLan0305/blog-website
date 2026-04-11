package com.group.blog.repository;

import com.group.blog.entity.User;
import com.group.blog.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {

    long countByFollowing(User following); // Đếm người theo dõi
    long countByFollower(User follower);   // Đếm người đang theo dõi

    // Tìm record để xóa khi Unfollow
    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);

    // Kiểm tra trạng thái Follow (Dùng Username cho lẹ, đỡ query thêm User)
    boolean existsByFollowerUsernameAndFollowing(String followerUsername, User following);

    // Lấy danh sách
    List<UserFollow> findByFollowingOrderByCreatedAtDesc(User following); // Lấy Followers
    List<UserFollow> findByFollowerOrderByCreatedAtDesc(User follower);   // Lấy Following
}