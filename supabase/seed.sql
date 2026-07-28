insert into public.roles(slug,name) values
('super_admin','Super Admin'),('admin','Admin'),('finance_manager','Finance Manager'),
('content_manager','Content Manager'),('moderator','Moderator'),('support_agent','Support Agent'),
('analyst','Analyst'),('developer','Developer'),('user','User')
on conflict do nothing;

insert into public.permissions(slug,description) values
('users.view','View users'),('users.edit','Edit users'),('users.suspend','Suspend users'),
('credits.view','View credit ledger'),('credits.adjust','Adjust credits'),
('payments.view','View payments'),('payments.refund','Refund verified payments'),
('plans.manage','Manage plans'),('models.manage','Manage models'),('providers.manage','Manage providers'),
('content.manage','Manage CMS content'),('reports.manage','Manage moderation reports'),
('support.manage','Manage support'),('roles.manage','Manage roles'),('settings.manage','Manage settings'),
('logs.view','View audit logs'),('api_keys.manage','Manage API access')
on conflict do nothing;

insert into public.plans(slug,name,monthly_price,annual_price,included_credits,storage_gb,api_limit,team_seats,featured,sort_order) values
('free','Free',0,0,80,1,0,1,false,1),
('creator','Creator',12,108,1000,10,0,1,false,2),
('pro','Pro',29,278,3500,50,10000,1,true,3),
('business','Business',79,758,10000,250,50000,5,false,4)
on conflict do nothing;

insert into public.credit_packs(slug,name,credits,bonus_credits,price,featured,sort_order) values
('starter-500','Starter Pack',500,0,6,false,1),
('creator-2000','Creator Pack',2000,200,18,true,2),
('studio-5000','Studio Pack',5000,750,42,false,3)
on conflict do nothing;
