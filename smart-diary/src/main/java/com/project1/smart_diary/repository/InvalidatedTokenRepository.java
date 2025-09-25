package com.project1.smart_diary.repository;

import com.project1.smart_diary.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken,Long> {
    boolean existsByJti(String jti);
}
