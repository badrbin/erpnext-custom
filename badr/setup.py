
from setuptools import setup, find_packages

setup(
    name='badr',
    version='0.0.1',
    description='Badr - A Frappe application (empty scaffold)',
    author='Your Name or Company',
    author_email='your_email@example.com',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=('frappe',)
)
