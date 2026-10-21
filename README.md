# ProductTrace

Blockchain-based product tracking system (Blockchain Technology mini project).

## Problem Statement

BT:Develop a blockchain application to track products from manufacturer to customer. Record each stage of the product journey to improve traceability and prevent unauthorized modification of tracking records.

## Project Objective

Build a simple blockchain application that records a product’s journey from manufacturer to customer. Each stage of the supply chain is stored on-chain so tracking history is transparent, verifiable, and resistant to unauthorized changes.

## Planned Features

- Register a product on the blockchain with a unique product ID
- Record each journey stage (manufacturer, distributor, retailer, customer)
- Store timestamp, location, and handler details for every stage
- Display the full product history for traceability
- Restrict updates so existing tracking records cannot be altered
- Simple web interface to add products, update stages, and view history

## Planned Folder Structure

- `frontend/` — React user interface
- `contracts/` — Solidity smart contracts
- `tests/` — contract and application tests
- `scripts/` — deployment and helper scripts
