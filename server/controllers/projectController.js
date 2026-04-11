import Project from '../models/Project.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, requiredDevs } = req.body;
    const newProject = await Project.create({
      title,
      description,
      requiredDevs,
      creatorId: req.user._id
    });
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isOpen: true }).populate('creatorId', 'name location');
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

    project.isOpen = false;
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error completing project', error: error.message });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ creatorId: req.user._id }).populate('requests', 'name role skills email phone');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my projects', error: error.message });
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

    const updatedProject = await Project.findById(projId).populate('requests', 'name role skills email phone');
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting request', error: error.message });
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
