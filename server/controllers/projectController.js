import Project from '../models/Project.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, requiredDevs, hackathonId } = req.body;
    const payload = {
      title,
      description,
      requiredDevs,
      creatorId: req.user._id
    };
    if (hackathonId) payload.hackathonId = hackathonId;
    
    const newProject = await Project.create(payload);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isOpen: true, hackathonId: { $exists: false } }).populate('creatorId', 'name location');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

export const completeProject = async (req, res) => {
  try {
    const { projId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creatorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    project.isOpen = !project.isOpen;
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling project status', error: error.message });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ creatorId: req.user._id, isFinished: false })
      .populate('requests', 'name role skills email phone')
      .populate('collaborators', 'name role skills email phone');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my projects', error: error.message });
  }
};

export const getJoinedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ collaborators: req.user._id, isFinished: false })
      .populate('creatorId', 'name email')
      .populate('collaborators', 'name role skills email phone');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching joined projects', error: error.message });
  }
};

export const getHistoryProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 
      isFinished: true,
      $or: [
        { creatorId: req.user._id },
        { collaborators: req.user._id }
      ]
    })
      .populate('creatorId', 'name email location')
      .populate('collaborators', 'name role skills email phone');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

export const finishProject = async (req, res) => {
  try {
    const { projId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creatorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    project.isFinished = true;
    project.isOpen = false;
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error finishing project', error: error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { projId, userId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creatorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    const requestIndex = project.requests.findIndex(reqUserId => reqUserId.toString() === userId);
    if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' });

    if (!project.collaborators.includes(userId)) {
      project.collaborators.push(userId);
    }
    project.requests.splice(requestIndex, 1);
    await project.save();

    const updatedProject = await Project.findById(projId)
      .populate('requests', 'name role skills email phone')
      .populate('collaborators', 'name role skills email phone');
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting request', error: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { projId, userId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creatorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    const requestIndex = project.requests.findIndex(reqUserId => reqUserId.toString() === userId);
    if (requestIndex !== -1) {
      project.requests.splice(requestIndex, 1);
      if (!project.rejected.includes(userId)) project.rejected.push(userId);
      await project.save();
    }

    const updatedProject = await Project.findById(projId)
      .populate('requests', 'name role skills email phone')
      .populate('collaborators', 'name role skills email phone');
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { projId, userId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creatorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    project.collaborators = project.collaborators.filter(c => c.toString() !== userId.toString());
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error removing collaborator', error: error.message });
  }
};

export const fulfillRequirement = async (req, res) => {
  try {
    const { projId, reqId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.creatorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });
    
    const reqDoc = project.requiredDevs.id(reqId);
    if (reqDoc) {
      reqDoc.fulfilled = !reqDoc.fulfilled;
      await project.save();
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fulfilling', error: error.message });
  }
};

export const requestToJoin = async (req, res) => {
  try {
    const { projId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if user is rejected
    if (project.rejected && project.rejected.includes(req.user._id)) {
      return res.status(403).json({ message: 'You have been rejected from this project and cannot apply again.' });
    }

    // Ensure we don't duplicate
    if (!project.requests.includes(req.user._id)) {
      project.requests.push(req.user._id);
      await project.save();
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting to join', error: error.message });
  }
};

export const leaveProject = async (req, res) => {
  try {
    const { projId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creatorId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Team owner cannot leave the team. Delete it instead.' });
    }

    if (!project.collaborators.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not a member of this team.' });
    }

    project.collaborators = project.collaborators.filter(c => c.toString() !== req.user._id.toString());
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error leaving team', error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projId } = req.params;
    const project = await Project.findById(projId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (project.creatorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    await Project.findByIdAndDelete(projId);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};
