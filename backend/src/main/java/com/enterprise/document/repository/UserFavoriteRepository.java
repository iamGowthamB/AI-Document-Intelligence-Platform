package com.enterprise.document.repository;

import com.enterprise.document.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    List<UserFavorite> findByUserId(Long userId);
    Optional<UserFavorite> findByUserIdAndDocumentId(Long userId, Long documentId);
    boolean existsByUserIdAndDocumentId(Long userId, Long documentId);
}
