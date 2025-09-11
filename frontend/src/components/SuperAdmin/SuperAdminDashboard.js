import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, message, Space, Tag, Tooltip } from 'antd';
import { 
  UserOutlined, 
  ShopOutlined, 
  DollarOutlined, 
  PlusOutlined,
  EditOutlined,
  StopOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';

const { Option } = Select;

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStatistics();
    fetchCompanies();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/super-admin/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Failed to fetch platform statistics');
    }
  };

  const fetchCompanies = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/super-admin/companies?page=${page}&limit=${pageSize}`);
      if (response.data.success) {
        setCompanies(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      message.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (values) => {
    try {
      const response = await apiClient.post('/super-admin/companies', values);
      if (response.data.success) {
        message.success('Company created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        fetchCompanies();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error creating company:', error);
      message.error(error.response?.data?.message || 'Failed to create company');
    }
  };

  const handleToggleStatus = async (companyId, newStatus, reason = '') => {
    try {
      const response = await apiClient.put(`/super-admin/companies/${companyId}/status`, {
        status: newStatus,
        reason
      });
      if (response.data.success) {
        message.success(`Company ${newStatus} successfully`);
        fetchCompanies();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating company status:', error);
      message.error(error.response?.data?.message || 'Failed to update company status');
    }
  };

  const handleViewDetails = async (companyId) => {
    try {
      const response = await apiClient.get(`/super-admin/companies/${companyId}`);
      if (response.data.success) {
        setSelectedCompany(response.data.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      message.error('Failed to fetch company details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'orange';
      case 'inactive': return 'red';
      default: return 'default';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'starter': return 'blue';
      case 'professional': return 'green';
      case 'enterprise': return 'purple';
      case 'custom': return 'gold';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Company',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>@{record.domain}</div>
        </div>
      ),
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Plan',
      dataIndex: ['subscription', 'plan'],
      key: 'plan',
      render: (plan) => <Tag color={getPlanColor(plan)}>{plan?.toUpperCase()}</Tag>,
    },
    {
      title: 'Users',
      dataIndex: ['statistics', 'userCount'],
      key: 'userCount',
      render: (count, record) => (
        <span>{count}/{record.subscription?.maxUsers}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record._id)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="Suspend Company">
              <Button 
                type="text" 
                icon={<StopOutlined />} 
                danger
                onClick={() => handleToggleStatus(record._id, 'suspended', 'Suspended by super admin')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Activate Company">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                style={{ color: 'green' }}
                onClick={() => handleToggleStatus(record._id, 'active', 'Activated by super admin')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Super Admin Dashboard</h1>
        <p>Manage companies, subscriptions, and platform statistics</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Companies"
              value={statistics.overview?.totalCompanies || 0}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Companies"
              value={statistics.overview?.activeCompanies || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={statistics.overview?.totalUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Budgets"
              value={statistics.overview?.totalBudgets || 0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Companies Table */}
      <Card 
        title="Companies" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Company
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={companies}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchCompanies(page, pageSize),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} companies`,
          }}
        />
      </Card>

      {/* Create Company Modal */}
      <Modal
        title="Create New Company"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCompany}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="ACME Corporation" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="domain"
                label="Domain"
                rules={[
                  { required: true, message: 'Please enter domain' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Domain must contain only lowercase letters, numbers, and hyphens' }
                ]}
              >
                <Input placeholder="acme" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="industry"
                label="Industry"
                rules={[{ required: true, message: 'Please enter industry' }]}
              >
                <Input placeholder="FMCG" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please enter country' }]}
              >
                <Input placeholder="South Africa" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={['contactInfo', 'email']}
            label="Contact Email"
            rules={[
              { required: true, message: 'Please enter contact email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="contact@acme.com" />
          </Form.Item>

          <Form.Item
            name={['contactInfo', 'phone']}
            label="Contact Phone"
          >
            <Input placeholder="+27123456789" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['subscription', 'plan']}
                label="Subscription Plan"
                initialValue="starter"
              >
                <Select>
                  <Option value="starter">Starter</Option>
                  <Option value="professional">Professional</Option>
                  <Option value="enterprise">Enterprise</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['subscription', 'maxUsers']}
                label="Max Users"
                initialValue={10}
              >
                <Input type="number" min={1} max={1000} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['subscription', 'maxBudgets']}
                label="Max Budgets"
                initialValue={5}
              >
                <Input type="number" min={1} max={100} />
              </Form.Item>
            </Col>
          </Row>

          <h3>Admin User</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['adminUser', 'firstName']}
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['adminUser', 'lastName']}
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['adminUser', 'email']}
                label="Admin Email"
                rules={[
                  { required: true, message: 'Please enter admin email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="admin@acme.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['adminUser', 'password']}
                label="Admin Password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character'
                  }
                ]}
              >
                <Input.Password placeholder="Strong password" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Company
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Company Details Modal */}
      <Modal
        title="Company Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCompany && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Company Information" size="small">
                  <p><strong>Name:</strong> {selectedCompany.name}</p>
                  <p><strong>Domain:</strong> @{selectedCompany.domain}</p>
                  <p><strong>Industry:</strong> {selectedCompany.industry}</p>
                  <p><strong>Country:</strong> {selectedCompany.country}</p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedCompany.status)}>{selectedCompany.status?.toUpperCase()}</Tag></p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Subscription" size="small">
                  <p><strong>Plan:</strong> <Tag color={getPlanColor(selectedCompany.subscription?.plan)}>{selectedCompany.subscription?.plan?.toUpperCase()}</Tag></p>
                  <p><strong>Max Users:</strong> {selectedCompany.subscription?.maxUsers}</p>
                  <p><strong>Max Budgets:</strong> {selectedCompany.subscription?.maxBudgets}</p>
                  <p><strong>Status:</strong> {selectedCompany.subscription?.status}</p>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Card title="Statistics" size="small">
                  <p><strong>Total Users:</strong> {selectedCompany.statistics?.users?.total || 0}</p>
                  <p><strong>Active Users:</strong> {selectedCompany.statistics?.users?.active || 0}</p>
                  <p><strong>Total Budgets:</strong> {selectedCompany.statistics?.budgets?.total || 0}</p>
                  <p><strong>Active Budgets:</strong> {selectedCompany.statistics?.budgets?.active || 0}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Contact Information" size="small">
                  <p><strong>Email:</strong> {selectedCompany.contactInfo?.email}</p>
                  <p><strong>Phone:</strong> {selectedCompany.contactInfo?.phone || 'N/A'}</p>
                  <p><strong>Created:</strong> {new Date(selectedCompany.createdAt).toLocaleDateString()}</p>
                </Card>
              </Col>
            </Row>

            {selectedCompany.recentUsers && selectedCompany.recentUsers.length > 0 && (
              <Card title="Recent Users" size="small" style={{ marginTop: '16px' }}>
                <Table
                  dataSource={selectedCompany.recentUsers}
                  columns={[
                    { title: 'Name', dataIndex: 'firstName', render: (text, record) => `${record.firstName} ${record.lastName}` },
                    { title: 'Email', dataIndex: 'email' },
                    { title: 'Role', dataIndex: 'role', render: (role) => <Tag>{role}</Tag> },
                    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag> },
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="_id"
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;