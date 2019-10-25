'use strict';
import * as fs from 'fs';
import {Contract} from './contract';
import {Project} from './project';
import {formatPath} from '../util';

export class ContractCollection {
    public contracts: Array<Contract>;
    constructor() {
        this.contracts = new Array<Contract>();
    }

    public findContract(contract: Contract, contractPath: string) {
        return contract.absolutePath === contractPath;
    }

    public containsContract(contractPath: string) {
        return this.contracts.findIndex((contract: Contract) => { return contract.absolutePath === contractPath; }) > -1;
    }

    public getDefaultContractsForCompilation() {
        const compilerOutputSelection = {
            '*': {
                '': ['ast'],
                '*': ['abi', 'devdoc', 'userdoc', 'metadata', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates'],
            },
        };

        return this.getContractsForCompilation(true, 200, compilerOutputSelection);
    }

    public getDefaultContractsForCompilationDiagnostics() {
        const compilerOutputSelection = {
            '*': {
                '': [],
                '*': [],
            },
        };

        return this.getContractsForCompilation(false, 0, compilerOutputSelection);
    }

    public getContractsForCompilation(optimizeCompilation: boolean, optimizeCompilationRuns: number, outputSelection) {
        const contractsForCompilation = {};
        this.contracts.forEach(contract => {
            contractsForCompilation[contract.absolutePath] = {content: contract.code};
        });
        const compilation = {
            language: 'Solidity',
            settings:
            {
                optimizer: {
                    enabled: optimizeCompilation,
                    runs: optimizeCompilationRuns,
                },
                outputSelection: outputSelection,
            },
            sources : contractsForCompilation,
        };
        return compilation;
    }


    public addContractAndResolveImports(contractPath: string, code: string, project: Project) {
        const contract = this.addContract(contractPath, code);
        if (contract !== null) {
            contract.resolveImports();
            contract.imports.forEach(foundImport => {
                if (fs.existsSync(foundImport)) {
                    if (!this.containsContract(foundImport)) {
                        const importContractCode = this.readContractCode(foundImport);
                        if (importContractCode != null) {
                            this.addContractAndResolveImports(foundImport, importContractCode, project);
                        }
                    }
                } else {
                    this.addContractAndResolveDependencyImport(foundImport, contract, project);
                }
            });
        }
        return contract;
    }

    private addContract(contractPath: string, code: string) {
        if (!this.containsContract(contractPath)) {
            const contract = new Contract(contractPath, code);
            this.contracts.push(contract);
            return contract;
        }
        return null;
    }

    private formatContractPath(contractPath: string) {
        return formatPath(contractPath);
    }

    private getAllImportFromPackages() {
        const importsFromPackages = new Array<string>();
        this.contracts.forEach(contract => {
            const contractImports = contract.getAllImportFromPackages();
            contractImports.forEach(contractImport => {
                if (importsFromPackages.indexOf(contractImport) < 0) {
                    importsFromPackages.push(contractImport);
                }
            });
        });
        return importsFromPackages;
    }

    private readContractCode(contractPath: string) {
        if (fs.existsSync(contractPath)) {
            return fs.readFileSync(contractPath, 'utf8');
        }
        return null;
    }

    private addContractAndResolveDependencyImport(dependencyImport: string, contract: Contract, project: Project) {
        const depPack = project.findPackage(dependencyImport);
        if (depPack !== undefined) {
            const depImportPath = this.formatContractPath(depPack.resolveImport(dependencyImport));
            if (!this.containsContract(depImportPath)) {
                const importContractCode = this.readContractCode(depImportPath);
                if (importContractCode != null) {
                    this.addContractAndResolveImports(depImportPath, importContractCode, project);
                    contract.replaceDependencyPath(dependencyImport, depImportPath);
                }
            } else {
                contract.replaceDependencyPath(dependencyImport, depImportPath);
            }
        }
    }
}
