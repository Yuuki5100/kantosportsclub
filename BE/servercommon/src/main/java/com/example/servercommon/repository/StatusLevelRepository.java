package com.example.servercommon.repository;

import com.example.servercommon.model.StatusLevelModel;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusLevelRepository extends JpaRepository<StatusLevelModel, Integer> {
    List<StatusLevelModel> findAllByStatusLevelIdIn(Collection<Integer> statusLevelIds);
}
