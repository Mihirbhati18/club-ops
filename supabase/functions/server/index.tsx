import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use('*', logger(console.log));

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register new user
app.post('/make-server-5c1df398/auth/register', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true, // Auto-confirm since email server isn't configured
    });

    if (authError) {
      console.log(`Auth error during user registration: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store additional user data in KV
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      message: 'User registered successfully',
      user: { id: authData.user.id, email, name, role }
    }, 201);
  } catch (error) {
    console.log(`Error during registration: ${error}`);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Get current user profile
app.get('/make-server-5c1df398/auth/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    return c.json({ user: userData ?? user.user_metadata });
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// ============================================
// DEPARTMENTS ROUTES
// ============================================

app.get('/make-server-5c1df398/departments', async (c) => {
  try {
    const departments = await kv.getByPrefix('department:');
    return c.json({ departments: departments || [] });
  } catch (error) {
    console.log(`Error fetching departments: ${error}`);
    return c.json({ error: 'Failed to fetch departments' }, 500);
  }
});

app.post('/make-server-5c1df398/departments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const department = await c.req.json();
    const id = `dept_${Date.now()}`;
    const newDepartment = { ...department, id, createdAt: new Date().toISOString() };
    
    await kv.set(`department:${id}`, newDepartment);
    return c.json({ department: newDepartment }, 201);
  } catch (error) {
    console.log(`Error creating department: ${error}`);
    return c.json({ error: 'Failed to create department' }, 500);
  }
});

app.put('/make-server-5c1df398/departments/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`department:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Department not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`department:${id}`, updated);
    return c.json({ department: updated });
  } catch (error) {
    console.log(`Error updating department: ${error}`);
    return c.json({ error: 'Failed to update department' }, 500);
  }
});

app.delete('/make-server-5c1df398/departments/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`department:${id}`);
    return c.json({ message: 'Department deleted' });
  } catch (error) {
    console.log(`Error deleting department: ${error}`);
    return c.json({ error: 'Failed to delete department' }, 500);
  }
});

// ============================================
// EVENTS ROUTES
// ============================================

app.get('/make-server-5c1df398/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    return c.json({ events: events || [] });
  } catch (error) {
    console.log(`Error fetching events: ${error}`);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

app.post('/make-server-5c1df398/events', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const event = await c.req.json();
    const id = `event_${Date.now()}`;
    const newEvent = { ...event, id, createdAt: new Date().toISOString(), registrations: 0 };
    
    await kv.set(`event:${id}`, newEvent);
    return c.json({ event: newEvent }, 201);
  } catch (error) {
    console.log(`Error creating event: ${error}`);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

app.put('/make-server-5c1df398/events/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`event:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`event:${id}`, updated);
    return c.json({ event: updated });
  } catch (error) {
    console.log(`Error updating event: ${error}`);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

app.delete('/make-server-5c1df398/events/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`event:${id}`);
    return c.json({ message: 'Event deleted' });
  } catch (error) {
    console.log(`Error deleting event: ${error}`);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// ============================================
// PROJECTS ROUTES
// ============================================

app.get('/make-server-5c1df398/projects', async (c) => {
  try {
    const projects = await kv.getByPrefix('project:');
    return c.json({ projects: projects || [] });
  } catch (error) {
    console.log(`Error fetching projects: ${error}`);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

app.post('/make-server-5c1df398/projects', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const project = await c.req.json();
    const id = `proj_${Date.now()}`;
    const newProject = { ...project, id, createdAt: new Date().toISOString() };
    
    await kv.set(`project:${id}`, newProject);
    return c.json({ project: newProject }, 201);
  } catch (error) {
    console.log(`Error creating project: ${error}`);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

app.put('/make-server-5c1df398/projects/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`project:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`project:${id}`, updated);
    return c.json({ project: updated });
  } catch (error) {
    console.log(`Error updating project: ${error}`);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

app.delete('/make-server-5c1df398/projects/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`project:${id}`);
    return c.json({ message: 'Project deleted' });
  } catch (error) {
    console.log(`Error deleting project: ${error}`);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// ============================================
// FINANCE ROUTES
// ============================================

app.get('/make-server-5c1df398/finance', async (c) => {
  try {
    const financeRecords = await kv.getByPrefix('finance:');
    return c.json({ finance: financeRecords || [] });
  } catch (error) {
    console.log(`Error fetching finance: ${error}`);
    return c.json({ error: 'Failed to fetch finance records' }, 500);
  }
});

app.post('/make-server-5c1df398/finance', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const record = await c.req.json();
    const id = `fin_${Date.now()}`;
    const newRecord = { ...record, id, createdAt: new Date().toISOString() };
    
    await kv.set(`finance:${id}`, newRecord);
    return c.json({ record: newRecord }, 201);
  } catch (error) {
    console.log(`Error creating finance record: ${error}`);
    return c.json({ error: 'Failed to create finance record' }, 500);
  }
});

app.put('/make-server-5c1df398/finance/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`finance:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Finance record not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`finance:${id}`, updated);
    return c.json({ record: updated });
  } catch (error) {
    console.log(`Error updating finance record: ${error}`);
    return c.json({ error: 'Failed to update finance record' }, 500);
  }
});

app.delete('/make-server-5c1df398/finance/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`finance:${id}`);
    return c.json({ message: 'Finance record deleted' });
  } catch (error) {
    console.log(`Error deleting finance record: ${error}`);
    return c.json({ error: 'Failed to delete finance record' }, 500);
  }
});

// ============================================
// MEETINGS ROUTES
// ============================================

app.get('/make-server-5c1df398/meetings', async (c) => {
  try {
    const meetings = await kv.getByPrefix('meeting:');
    return c.json({ meetings: meetings || [] });
  } catch (error) {
    console.log(`Error fetching meetings: ${error}`);
    return c.json({ error: 'Failed to fetch meetings' }, 500);
  }
});

app.post('/make-server-5c1df398/meetings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const meeting = await c.req.json();
    const id = `meet_${Date.now()}`;
    const newMeeting = { ...meeting, id, createdAt: new Date().toISOString() };
    
    await kv.set(`meeting:${id}`, newMeeting);
    return c.json({ meeting: newMeeting }, 201);
  } catch (error) {
    console.log(`Error creating meeting: ${error}`);
    return c.json({ error: 'Failed to create meeting' }, 500);
  }
});

app.put('/make-server-5c1df398/meetings/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`meeting:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Meeting not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`meeting:${id}`, updated);
    return c.json({ meeting: updated });
  } catch (error) {
    console.log(`Error updating meeting: ${error}`);
    return c.json({ error: 'Failed to update meeting' }, 500);
  }
});

app.delete('/make-server-5c1df398/meetings/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'Admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`meeting:${id}`);
    return c.json({ message: 'Meeting deleted' });
  } catch (error) {
    console.log(`Error deleting meeting: ${error}`);
    return c.json({ error: 'Failed to delete meeting' }, 500);
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

app.get('/make-server-5c1df398/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notifications = await kv.getByPrefix('notification:');
    return c.json({ notifications: notifications || [] });
  } catch (error) {
    console.log(`Error fetching notifications: ${error}`);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

app.post('/make-server-5c1df398/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notification = await c.req.json();
    const id = `notif_${Date.now()}`;
    const newNotification = { ...notification, id, createdAt: new Date().toISOString(), read: false };
    
    await kv.set(`notification:${id}`, newNotification);
    return c.json({ notification: newNotification }, 201);
  } catch (error) {
    console.log(`Error creating notification: ${error}`);
    return c.json({ error: 'Failed to create notification' }, 500);
  }
});

Deno.serve(app.fetch);
